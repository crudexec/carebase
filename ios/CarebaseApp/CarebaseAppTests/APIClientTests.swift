import XCTest
@testable import CarebaseApp

// MARK: - Mock URL Protocol
class MockURLProtocol: URLProtocol {
    static var requestHandler: ((URLRequest) throws -> (HTTPURLResponse, Data))?
    static var capturedRequests: [URLRequest] = []

    override class func canInit(with request: URLRequest) -> Bool {
        return true
    }

    override class func canonicalRequest(for request: URLRequest) -> URLRequest {
        return request
    }

    override func startLoading() {
        MockURLProtocol.capturedRequests.append(request)

        guard let handler = MockURLProtocol.requestHandler else {
            XCTFail("No request handler set")
            return
        }

        do {
            let (response, data) = try handler(request)
            client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
            client?.urlProtocol(self, didLoad: data)
            client?.urlProtocolDidFinishLoading(self)
        } catch {
            client?.urlProtocol(self, didFailWithError: error)
        }
    }

    override func stopLoading() {}

    static func reset() {
        requestHandler = nil
        capturedRequests = []
    }
}

// MARK: - Testable API Client
class TestableAPIClient {
    private let session: URLSession
    private var sessionCookie: String?
    private let baseURL = "https://test.carebase.app"

    init(session: URLSession) {
        self.session = session
    }

    func setSessionCookie(_ cookie: String?) {
        self.sessionCookie = cookie
    }

    func request<T: Decodable>(
        endpoint: APIEndpoint,
        method: HTTPMethod = .get,
        body: Encodable? = nil,
        queryParams: [String: String]? = nil
    ) async throws -> T {
        var urlComponents = URLComponents(string: "\(baseURL)\(endpoint.path)")!

        if let params = queryParams {
            urlComponents.queryItems = params.map { URLQueryItem(name: $0.key, value: $0.value) }
        }

        guard let url = urlComponents.url else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        if let cookie = sessionCookie {
            request.setValue(cookie, forHTTPHeaderField: "Cookie")
        }

        if let body = body {
            let encoder = JSONEncoder()
            encoder.dateEncodingStrategy = .iso8601
            request.httpBody = try encoder.encode(body)
        }

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        switch httpResponse.statusCode {
        case 200...299:
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .custom { decoder in
                let container = try decoder.singleValueContainer()

                if container.decodeNil() {
                    throw DecodingError.valueNotFound(Date.self, DecodingError.Context(codingPath: decoder.codingPath, debugDescription: "Date value is null"))
                }

                let dateString = try container.decode(String.self)

                let formatter = ISO8601DateFormatter()
                formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
                if let date = formatter.date(from: dateString) {
                    return date
                }

                formatter.formatOptions = [.withInternetDateTime]
                if let date = formatter.date(from: dateString) {
                    return date
                }

                throw DecodingError.dataCorruptedError(in: container, debugDescription: "Invalid date: \(dateString)")
            }
            return try decoder.decode(T.self, from: data)
        case 401:
            throw APIError.unauthorized
        case 403:
            throw APIError.forbidden
        case 404:
            throw APIError.notFound
        case 400, 422:
            let errorResponse = try? JSONDecoder().decode(ErrorResponse.self, from: data)
            throw APIError.validationError(errorResponse?.error ?? "Validation error")
        case 500...599:
            throw APIError.serverError
        default:
            throw APIError.unknown(httpResponse.statusCode)
        }
    }
}

final class APIClientTests: XCTestCase {
    var apiClient: TestableAPIClient!
    var session: URLSession!

    override func setUp() {
        super.setUp()
        MockURLProtocol.reset()

        let config = URLSessionConfiguration.ephemeral
        config.protocolClasses = [MockURLProtocol.self]
        session = URLSession(configuration: config)

        apiClient = TestableAPIClient(session: session)
    }

    override func tearDown() {
        MockURLProtocol.reset()
        super.tearDown()
    }

    // MARK: - Successful Request Tests

    func testGetClientsSuccess() async throws {
        let responseJSON = """
        {
            "clients": [
                {
                    "id": "client-1",
                    "firstName": "Margaret",
                    "lastName": "Thompson",
                    "dateOfBirth": null,
                    "phone": "+1234567890",
                    "address": "123 Oak Street",
                    "status": "ACTIVE",
                    "medicalNotes": null,
                    "createdAt": "2024-01-15T10:30:00.000Z",
                    "updatedAt": "2024-01-15T10:30:00.000Z",
                    "sponsor": null,
                    "assignedCarer": null
                }
            ],
            "pagination": {
                "page": 1,
                "limit": 50,
                "total": 1,
                "totalPages": 1
            }
        }
        """.data(using: .utf8)!

        MockURLProtocol.requestHandler = { request in
            XCTAssertEqual(request.url?.path, "/api/clients")
            XCTAssertEqual(request.httpMethod, "GET")

            let response = HTTPURLResponse(
                url: request.url!,
                statusCode: 200,
                httpVersion: nil,
                headerFields: nil
            )!
            return (response, responseJSON)
        }

        let response: ClientsResponse = try await apiClient.request(endpoint: .clients)

        XCTAssertEqual(response.clients.count, 1)
        XCTAssertEqual(response.clients.first?.firstName, "Margaret")
        XCTAssertEqual(response.pagination?.total, 1)
    }

    func testGetSingleClientSuccess() async throws {
        let responseJSON = """
        {
            "client": {
                "id": "client-123",
                "firstName": "Margaret",
                "lastName": "Thompson",
                "dateOfBirth": "1945-03-15T00:00:00.000Z",
                "phone": "+1234567890",
                "address": "123 Oak Street",
                "status": "ACTIVE",
                "medicalNotes": "Requires assistance",
                "createdAt": "2024-01-15T10:30:00.000Z",
                "updatedAt": "2024-01-15T10:30:00.000Z",
                "sponsor": {
                    "id": "sponsor-1",
                    "firstName": "Jane",
                    "lastName": "Thompson"
                },
                "assignedCarer": {
                    "id": "carer-1",
                    "firstName": "Sarah",
                    "lastName": "Johnson"
                }
            }
        }
        """.data(using: .utf8)!

        MockURLProtocol.requestHandler = { request in
            XCTAssertEqual(request.url?.path, "/api/clients/client-123")

            let response = HTTPURLResponse(
                url: request.url!,
                statusCode: 200,
                httpVersion: nil,
                headerFields: nil
            )!
            return (response, responseJSON)
        }

        let response: ClientResponse = try await apiClient.request(endpoint: .client(id: "client-123"))

        XCTAssertEqual(response.client.id, "client-123")
        XCTAssertEqual(response.client.fullName, "Margaret Thompson")
        XCTAssertNotNil(response.client.sponsor)
        XCTAssertNotNil(response.client.assignedCarer)
    }

    func testGetShiftsSuccess() async throws {
        let responseJSON = """
        {
            "shifts": [
                {
                    "id": "shift-1",
                    "clientId": "client-1",
                    "carerId": "carer-1",
                    "scheduledStart": "2024-01-15T09:00:00.000Z",
                    "scheduledEnd": "2024-01-15T12:00:00.000Z",
                    "actualStart": null,
                    "actualEnd": null,
                    "status": "SCHEDULED",
                    "notes": null,
                    "carer": {
                        "id": "carer-1",
                        "firstName": "Sarah",
                        "lastName": "Johnson"
                    },
                    "client": {
                        "id": "client-1",
                        "firstName": "Margaret",
                        "lastName": "Thompson",
                        "address": "123 Oak Street"
                    },
                    "createdAt": "2024-01-14T10:30:00.000Z",
                    "updatedAt": "2024-01-14T10:30:00.000Z"
                }
            ]
        }
        """.data(using: .utf8)!

        MockURLProtocol.requestHandler = { request in
            XCTAssertEqual(request.url?.path, "/api/scheduling")

            let response = HTTPURLResponse(
                url: request.url!,
                statusCode: 200,
                httpVersion: nil,
                headerFields: nil
            )!
            return (response, responseJSON)
        }

        let response: ShiftsResponse = try await apiClient.request(endpoint: .shifts)

        XCTAssertEqual(response.shifts.count, 1)
        XCTAssertEqual(response.shifts.first?.status, .scheduled)
    }

    // MARK: - Error Response Tests

    func testUnauthorizedError() async {
        MockURLProtocol.requestHandler = { request in
            let response = HTTPURLResponse(
                url: request.url!,
                statusCode: 401,
                httpVersion: nil,
                headerFields: nil
            )!
            return (response, Data())
        }

        do {
            let _: ClientsResponse = try await apiClient.request(endpoint: .clients)
            XCTFail("Should have thrown unauthorized error")
        } catch let error as APIError {
            XCTAssertEqual(error, APIError.unauthorized)
            XCTAssertEqual(error.errorDescription, "Please sign in to continue")
        } catch {
            XCTFail("Wrong error type: \(error)")
        }
    }

    func testForbiddenError() async {
        MockURLProtocol.requestHandler = { request in
            let response = HTTPURLResponse(
                url: request.url!,
                statusCode: 403,
                httpVersion: nil,
                headerFields: nil
            )!
            return (response, Data())
        }

        do {
            let _: ClientsResponse = try await apiClient.request(endpoint: .clients)
            XCTFail("Should have thrown forbidden error")
        } catch let error as APIError {
            XCTAssertEqual(error, APIError.forbidden)
            XCTAssertEqual(error.errorDescription, "You don't have permission to access this")
        } catch {
            XCTFail("Wrong error type: \(error)")
        }
    }

    func testNotFoundError() async {
        MockURLProtocol.requestHandler = { request in
            let response = HTTPURLResponse(
                url: request.url!,
                statusCode: 404,
                httpVersion: nil,
                headerFields: nil
            )!
            return (response, Data())
        }

        do {
            let _: ClientResponse = try await apiClient.request(endpoint: .client(id: "nonexistent"))
            XCTFail("Should have thrown not found error")
        } catch let error as APIError {
            XCTAssertEqual(error, APIError.notFound)
            XCTAssertEqual(error.errorDescription, "The requested resource was not found")
        } catch {
            XCTFail("Wrong error type: \(error)")
        }
    }

    func testServerError() async {
        MockURLProtocol.requestHandler = { request in
            let response = HTTPURLResponse(
                url: request.url!,
                statusCode: 500,
                httpVersion: nil,
                headerFields: nil
            )!
            return (response, Data())
        }

        do {
            let _: ClientsResponse = try await apiClient.request(endpoint: .clients)
            XCTFail("Should have thrown server error")
        } catch let error as APIError {
            XCTAssertEqual(error, APIError.serverError)
            XCTAssertEqual(error.errorDescription, "Something went wrong. Please try again.")
        } catch {
            XCTFail("Wrong error type: \(error)")
        }
    }

    func testValidationError() async {
        let errorJSON = """
        {
            "error": "Invalid input data"
        }
        """.data(using: .utf8)!

        MockURLProtocol.requestHandler = { request in
            let response = HTTPURLResponse(
                url: request.url!,
                statusCode: 400,
                httpVersion: nil,
                headerFields: nil
            )!
            return (response, errorJSON)
        }

        do {
            let _: ClientsResponse = try await apiClient.request(endpoint: .clients)
            XCTFail("Should have thrown validation error")
        } catch let error as APIError {
            if case .validationError(let message) = error {
                XCTAssertEqual(message, "Invalid input data")
            } else {
                XCTFail("Wrong error type")
            }
        } catch {
            XCTFail("Wrong error type: \(error)")
        }
    }

    // MARK: - Request Configuration Tests

    func testRequestWithQueryParams() async throws {
        let responseJSON = """
        {
            "clients": [],
            "pagination": {"page": 1, "limit": 10, "total": 0, "totalPages": 0}
        }
        """.data(using: .utf8)!

        MockURLProtocol.requestHandler = { request in
            XCTAssertTrue(request.url?.absoluteString.contains("page=2") ?? false)
            XCTAssertTrue(request.url?.absoluteString.contains("status=ACTIVE") ?? false)

            let response = HTTPURLResponse(
                url: request.url!,
                statusCode: 200,
                httpVersion: nil,
                headerFields: nil
            )!
            return (response, responseJSON)
        }

        let _: ClientsResponse = try await apiClient.request(
            endpoint: .clients,
            queryParams: ["page": "2", "status": "ACTIVE"]
        )
    }

    func testRequestWithSessionCookie() async throws {
        let responseJSON = """
        {"clients": [], "pagination": {"page": 1, "limit": 50, "total": 0, "totalPages": 0}}
        """.data(using: .utf8)!

        apiClient.setSessionCookie("session_token=abc123")

        MockURLProtocol.requestHandler = { request in
            XCTAssertEqual(request.value(forHTTPHeaderField: "Cookie"), "session_token=abc123")

            let response = HTTPURLResponse(
                url: request.url!,
                statusCode: 200,
                httpVersion: nil,
                headerFields: nil
            )!
            return (response, responseJSON)
        }

        let _: ClientsResponse = try await apiClient.request(endpoint: .clients)
    }

    func testPostRequestWithBody() async throws {
        let responseJSON = """
        {
            "visitNote": {
                "id": "note-1",
                "templateId": "template-1",
                "templateVersion": 1,
                "shiftId": "shift-1",
                "clientId": "client-1",
                "carerId": "carer-1",
                "submittedById": "carer-1",
                "submittedAt": "2024-01-15T12:00:00.000Z",
                "formSchemaSnapshot": null,
                "data": {"mood": "Good"},
                "template": {"id": "template-1", "name": "Daily Report"},
                "client": {"id": "client-1", "firstName": "Margaret", "lastName": "Thompson"},
                "carer": {"id": "carer-1", "firstName": "Sarah", "lastName": "Johnson"},
                "submittedBy": null,
                "shift": null
            }
        }
        """.data(using: .utf8)!

        MockURLProtocol.requestHandler = { request in
            XCTAssertEqual(request.httpMethod, "POST")
            XCTAssertNotNil(request.httpBody)

            let response = HTTPURLResponse(
                url: request.url!,
                statusCode: 201,
                httpVersion: nil,
                headerFields: nil
            )!
            return (response, responseJSON)
        }

        let requestBody = CreateVisitNoteRequest(
            templateId: "template-1",
            shiftId: "shift-1",
            clientId: "client-1",
            data: ["mood": AnyCodable("Good")]
        )

        let response: VisitNoteResponse = try await apiClient.request(
            endpoint: .visitNotes,
            method: .post,
            body: requestBody
        )

        XCTAssertEqual(response.visitNote.id, "note-1")
    }

    // MARK: - Endpoint Path Tests

    func testEndpointPaths() {
        XCTAssertEqual(APIEndpoint.shifts.path, "/api/scheduling")
        XCTAssertEqual(APIEndpoint.shift(id: "123").path, "/api/scheduling/123")
        XCTAssertEqual(APIEndpoint.checkIn(shiftId: "123").path, "/api/check-in/123/check-in")
        XCTAssertEqual(APIEndpoint.checkOut(shiftId: "123").path, "/api/check-in/123/check-out")
        XCTAssertEqual(APIEndpoint.clients.path, "/api/clients")
        XCTAssertEqual(APIEndpoint.client(id: "456").path, "/api/clients/456")
        XCTAssertEqual(APIEndpoint.visitNotes.path, "/api/visit-notes")
        XCTAssertEqual(APIEndpoint.visitNote(id: "789").path, "/api/visit-notes/789")
        XCTAssertEqual(APIEndpoint.formTemplates.path, "/api/visit-notes/templates")
        XCTAssertEqual(APIEndpoint.enabledTemplates.path, "/api/visit-notes/templates/enabled")
        XCTAssertEqual(APIEndpoint.notifications.path, "/api/notifications")
    }

    // MARK: - Date Decoding Tests

    func testDateDecodingWithFractionalSeconds() async throws {
        let responseJSON = """
        {
            "client": {
                "id": "client-1",
                "firstName": "Margaret",
                "lastName": "Thompson",
                "dateOfBirth": "1945-03-15T00:00:00.123Z",
                "phone": null,
                "address": null,
                "status": "ACTIVE",
                "medicalNotes": null,
                "createdAt": "2024-01-15T10:30:00.456Z",
                "updatedAt": "2024-01-15T10:30:00.789Z",
                "sponsor": null,
                "assignedCarer": null
            }
        }
        """.data(using: .utf8)!

        MockURLProtocol.requestHandler = { request in
            let response = HTTPURLResponse(
                url: request.url!,
                statusCode: 200,
                httpVersion: nil,
                headerFields: nil
            )!
            return (response, responseJSON)
        }

        let response: ClientResponse = try await apiClient.request(endpoint: .client(id: "client-1"))

        XCTAssertNotNil(response.client.dateOfBirth)
        XCTAssertNotNil(response.client.createdAt)
        XCTAssertNotNil(response.client.updatedAt)
    }

    func testDateDecodingWithoutFractionalSeconds() async throws {
        let responseJSON = """
        {
            "client": {
                "id": "client-1",
                "firstName": "Margaret",
                "lastName": "Thompson",
                "dateOfBirth": "1945-03-15T00:00:00Z",
                "phone": null,
                "address": null,
                "status": "ACTIVE",
                "medicalNotes": null,
                "createdAt": "2024-01-15T10:30:00Z",
                "updatedAt": "2024-01-15T10:30:00Z",
                "sponsor": null,
                "assignedCarer": null
            }
        }
        """.data(using: .utf8)!

        MockURLProtocol.requestHandler = { request in
            let response = HTTPURLResponse(
                url: request.url!,
                statusCode: 200,
                httpVersion: nil,
                headerFields: nil
            )!
            return (response, responseJSON)
        }

        let response: ClientResponse = try await apiClient.request(endpoint: .client(id: "client-1"))

        XCTAssertNotNil(response.client.dateOfBirth)
    }

    func testNullDateHandling() async throws {
        let responseJSON = """
        {
            "client": {
                "id": "client-1",
                "firstName": "Margaret",
                "lastName": "Thompson",
                "dateOfBirth": null,
                "phone": null,
                "address": null,
                "status": "ACTIVE",
                "medicalNotes": null,
                "createdAt": "2024-01-15T10:30:00.000Z",
                "updatedAt": "2024-01-15T10:30:00.000Z",
                "sponsor": null,
                "assignedCarer": null
            }
        }
        """.data(using: .utf8)!

        MockURLProtocol.requestHandler = { request in
            let response = HTTPURLResponse(
                url: request.url!,
                statusCode: 200,
                httpVersion: nil,
                headerFields: nil
            )!
            return (response, responseJSON)
        }

        let response: ClientResponse = try await apiClient.request(endpoint: .client(id: "client-1"))

        XCTAssertNil(response.client.dateOfBirth)
    }
}

// MARK: - APIError Equatable
extension APIError: Equatable {
    public static func == (lhs: APIError, rhs: APIError) -> Bool {
        switch (lhs, rhs) {
        case (.invalidURL, .invalidURL),
             (.invalidResponse, .invalidResponse),
             (.unauthorized, .unauthorized),
             (.forbidden, .forbidden),
             (.notFound, .notFound),
             (.serverError, .serverError),
             (.uploadFailed, .uploadFailed):
            return true
        case (.validationError(let l), .validationError(let r)):
            return l == r
        case (.loginFailed(let l), .loginFailed(let r)):
            return l == r
        case (.unknown(let l), .unknown(let r)):
            return l == r
        default:
            return false
        }
    }
}
