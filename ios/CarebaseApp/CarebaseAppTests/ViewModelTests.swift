import XCTest
@testable import CarebaseApp

// MARK: - Mock API Client Protocol
protocol APIClientProtocol {
    func request<T: Decodable>(
        endpoint: APIEndpoint,
        method: HTTPMethod,
        body: Encodable?,
        queryParams: [String: String]?
    ) async throws -> T
}

// MARK: - Mock API Client Implementation
class MockAPIClient: APIClientProtocol {
    var mockResponses: [String: Any] = [:]
    var mockErrors: [String: Error] = [:]
    var capturedEndpoints: [APIEndpoint] = []

    func request<T: Decodable>(
        endpoint: APIEndpoint,
        method: HTTPMethod = .get,
        body: Encodable? = nil,
        queryParams: [String: String]? = nil
    ) async throws -> T {
        capturedEndpoints.append(endpoint)

        let key = endpoint.path

        if let error = mockErrors[key] {
            throw error
        }

        guard let response = mockResponses[key] as? T else {
            throw APIError.invalidResponse
        }

        return response
    }

    func setMockResponse<T>(_ response: T, for endpoint: APIEndpoint) {
        mockResponses[endpoint.path] = response
    }

    func setMockError(_ error: Error, for endpoint: APIEndpoint) {
        mockErrors[endpoint.path] = error
    }
}

// MARK: - Testable ViewModels
// These are simplified versions for testing purposes

@MainActor
class TestableClientsViewModel: ObservableObject {
    @Published var clients: [Client] = []
    @Published var isLoading = false
    @Published var error: String?

    private let api: MockAPIClient

    init(api: MockAPIClient) {
        self.api = api
    }

    func loadClients() async {
        isLoading = true
        error = nil

        do {
            let response: ClientsResponse = try await api.request(
                endpoint: .clients,
                method: .get,
                body: nil,
                queryParams: nil
            )
            self.clients = response.clients
        } catch let apiError as APIError {
            self.error = apiError.errorDescription
        } catch {
            self.error = "Failed to load clients"
        }

        isLoading = false
    }
}

@MainActor
class TestableClientDetailViewModel: ObservableObject {
    @Published var client: Client?
    @Published var isLoading = false
    @Published var error: String?

    private let api: MockAPIClient

    init(api: MockAPIClient) {
        self.api = api
    }

    func loadClient(id: String) async {
        isLoading = true
        error = nil

        do {
            let response: ClientResponse = try await api.request(
                endpoint: .client(id: id),
                method: .get,
                body: nil,
                queryParams: nil
            )
            self.client = response.client
        } catch let apiError as APIError {
            self.error = apiError.errorDescription
        } catch {
            self.error = "Failed to load client"
        }

        isLoading = false
    }
}

@MainActor
class TestableShiftsViewModel: ObservableObject {
    @Published var shifts: [Shift] = []
    @Published var isLoading = false
    @Published var error: String?

    private let api: MockAPIClient

    init(api: MockAPIClient) {
        self.api = api
    }

    func loadShifts() async {
        isLoading = true
        error = nil

        do {
            let response: ShiftsResponse = try await api.request(
                endpoint: .shifts,
                method: .get,
                body: nil,
                queryParams: nil
            )
            self.shifts = response.shifts
        } catch let apiError as APIError {
            self.error = apiError.errorDescription
        } catch {
            self.error = "Failed to load shifts"
        }

        isLoading = false
    }
}

// MARK: - ViewModel Tests

final class ViewModelTests: XCTestCase {
    var mockAPI: MockAPIClient!

    override func setUp() {
        super.setUp()
        mockAPI = MockAPIClient()
    }

    override func tearDown() {
        mockAPI = nil
        super.tearDown()
    }

    // MARK: - ClientsViewModel Tests

    @MainActor
    func testClientsViewModelLoadSuccess() async {
        let viewModel = TestableClientsViewModel(api: mockAPI)

        let mockClient = createMockClient(id: "client-1", firstName: "Margaret", lastName: "Thompson")
        let mockResponse = ClientsResponse(
            clients: [mockClient],
            pagination: Pagination(page: 1, limit: 50, total: 1, totalPages: 1)
        )
        mockAPI.setMockResponse(mockResponse, for: .clients)

        await viewModel.loadClients()

        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNil(viewModel.error)
        XCTAssertEqual(viewModel.clients.count, 1)
        XCTAssertEqual(viewModel.clients.first?.firstName, "Margaret")
    }

    @MainActor
    func testClientsViewModelLoadMultipleClients() async {
        let viewModel = TestableClientsViewModel(api: mockAPI)

        let clients = [
            createMockClient(id: "1", firstName: "Margaret", lastName: "Thompson"),
            createMockClient(id: "2", firstName: "Robert", lastName: "Williams"),
            createMockClient(id: "3", firstName: "Elizabeth", lastName: "Davis")
        ]
        let mockResponse = ClientsResponse(
            clients: clients,
            pagination: Pagination(page: 1, limit: 50, total: 3, totalPages: 1)
        )
        mockAPI.setMockResponse(mockResponse, for: .clients)

        await viewModel.loadClients()

        XCTAssertEqual(viewModel.clients.count, 3)
    }

    @MainActor
    func testClientsViewModelLoadUnauthorized() async {
        let viewModel = TestableClientsViewModel(api: mockAPI)

        mockAPI.setMockError(APIError.unauthorized, for: .clients)

        await viewModel.loadClients()

        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNotNil(viewModel.error)
        XCTAssertEqual(viewModel.error, "Please sign in to continue")
        XCTAssertTrue(viewModel.clients.isEmpty)
    }

    @MainActor
    func testClientsViewModelLoadForbidden() async {
        let viewModel = TestableClientsViewModel(api: mockAPI)

        mockAPI.setMockError(APIError.forbidden, for: .clients)

        await viewModel.loadClients()

        XCTAssertNotNil(viewModel.error)
        XCTAssertEqual(viewModel.error, "You don't have permission to access this")
    }

    @MainActor
    func testClientsViewModelLoadServerError() async {
        let viewModel = TestableClientsViewModel(api: mockAPI)

        mockAPI.setMockError(APIError.serverError, for: .clients)

        await viewModel.loadClients()

        XCTAssertNotNil(viewModel.error)
        XCTAssertEqual(viewModel.error, "Something went wrong. Please try again.")
    }

    @MainActor
    func testClientsViewModelLoadingState() async {
        let viewModel = TestableClientsViewModel(api: mockAPI)

        XCTAssertFalse(viewModel.isLoading)

        let mockResponse = ClientsResponse(
            clients: [],
            pagination: Pagination(page: 1, limit: 50, total: 0, totalPages: 0)
        )
        mockAPI.setMockResponse(mockResponse, for: .clients)

        await viewModel.loadClients()

        XCTAssertFalse(viewModel.isLoading)
    }

    // MARK: - ClientDetailViewModel Tests

    @MainActor
    func testClientDetailViewModelLoadSuccess() async {
        let viewModel = TestableClientDetailViewModel(api: mockAPI)

        let mockClient = createMockClient(id: "client-123", firstName: "Margaret", lastName: "Thompson")
        let mockResponse = ClientResponse(client: mockClient)
        mockAPI.setMockResponse(mockResponse, for: .client(id: "client-123"))

        await viewModel.loadClient(id: "client-123")

        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNil(viewModel.error)
        XCTAssertNotNil(viewModel.client)
        XCTAssertEqual(viewModel.client?.id, "client-123")
        XCTAssertEqual(viewModel.client?.fullName, "Margaret Thompson")
    }

    @MainActor
    func testClientDetailViewModelLoadNotFound() async {
        let viewModel = TestableClientDetailViewModel(api: mockAPI)

        mockAPI.setMockError(APIError.notFound, for: .client(id: "nonexistent"))

        await viewModel.loadClient(id: "nonexistent")

        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNotNil(viewModel.error)
        XCTAssertEqual(viewModel.error, "The requested resource was not found")
        XCTAssertNil(viewModel.client)
    }

    @MainActor
    func testClientDetailViewModelLoadWithSponsor() async {
        let viewModel = TestableClientDetailViewModel(api: mockAPI)

        let mockSponsor = ClientSponsor(id: "sponsor-1", firstName: "Jane", lastName: "Thompson")
        let mockClient = createMockClient(
            id: "client-123",
            firstName: "Margaret",
            lastName: "Thompson",
            sponsor: mockSponsor
        )
        let mockResponse = ClientResponse(client: mockClient)
        mockAPI.setMockResponse(mockResponse, for: .client(id: "client-123"))

        await viewModel.loadClient(id: "client-123")

        XCTAssertNotNil(viewModel.client?.sponsor)
        XCTAssertEqual(viewModel.client?.sponsor?.fullName, "Jane Thompson")
    }

    @MainActor
    func testClientDetailViewModelLoadWithAssignedCarer() async {
        let viewModel = TestableClientDetailViewModel(api: mockAPI)

        let mockCarer = ClientCarer(id: "carer-1", firstName: "Sarah", lastName: "Johnson")
        let mockClient = createMockClient(
            id: "client-123",
            firstName: "Margaret",
            lastName: "Thompson",
            assignedCarer: mockCarer
        )
        let mockResponse = ClientResponse(client: mockClient)
        mockAPI.setMockResponse(mockResponse, for: .client(id: "client-123"))

        await viewModel.loadClient(id: "client-123")

        XCTAssertNotNil(viewModel.client?.assignedCarer)
        XCTAssertEqual(viewModel.client?.assignedCarer?.fullName, "Sarah Johnson")
    }

    // MARK: - ShiftsViewModel Tests

    @MainActor
    func testShiftsViewModelLoadSuccess() async {
        let viewModel = TestableShiftsViewModel(api: mockAPI)

        let mockShift = createMockShift(id: "shift-1", status: .scheduled)
        let mockResponse = ShiftsResponse(shifts: [mockShift])
        mockAPI.setMockResponse(mockResponse, for: .shifts)

        await viewModel.loadShifts()

        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNil(viewModel.error)
        XCTAssertEqual(viewModel.shifts.count, 1)
        XCTAssertEqual(viewModel.shifts.first?.status, .scheduled)
    }

    @MainActor
    func testShiftsViewModelLoadMultipleStatuses() async {
        let viewModel = TestableShiftsViewModel(api: mockAPI)

        let shifts = [
            createMockShift(id: "1", status: .scheduled),
            createMockShift(id: "2", status: .inProgress),
            createMockShift(id: "3", status: .completed)
        ]
        let mockResponse = ShiftsResponse(shifts: shifts)
        mockAPI.setMockResponse(mockResponse, for: .shifts)

        await viewModel.loadShifts()

        XCTAssertEqual(viewModel.shifts.count, 3)

        let statuses = viewModel.shifts.map { $0.status }
        XCTAssertTrue(statuses.contains(.scheduled))
        XCTAssertTrue(statuses.contains(.inProgress))
        XCTAssertTrue(statuses.contains(.completed))
    }

    @MainActor
    func testShiftsViewModelLoadUnauthorized() async {
        let viewModel = TestableShiftsViewModel(api: mockAPI)

        mockAPI.setMockError(APIError.unauthorized, for: .shifts)

        await viewModel.loadShifts()

        XCTAssertNotNil(viewModel.error)
        XCTAssertEqual(viewModel.error, "Please sign in to continue")
        XCTAssertTrue(viewModel.shifts.isEmpty)
    }

    @MainActor
    func testShiftsViewModelLoadEmpty() async {
        let viewModel = TestableShiftsViewModel(api: mockAPI)

        let mockResponse = ShiftsResponse(shifts: [])
        mockAPI.setMockResponse(mockResponse, for: .shifts)

        await viewModel.loadShifts()

        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNil(viewModel.error)
        XCTAssertTrue(viewModel.shifts.isEmpty)
    }

    // MARK: - Helper Methods

    private func createMockClient(
        id: String,
        firstName: String,
        lastName: String,
        status: ClientStatus = .active,
        sponsor: ClientSponsor? = nil,
        assignedCarer: ClientCarer? = nil
    ) -> Client {
        return Client(
            id: id,
            firstName: firstName,
            lastName: lastName,
            dateOfBirth: nil,
            phone: nil,
            email: nil,
            address: nil,
            status: status,
            profileImageURL: nil,
            medicalNotes: nil,
            createdAt: Date(),
            updatedAt: Date(),
            sponsor: sponsor,
            assignedCarer: assignedCarer
        )
    }

    private func createMockShift(
        id: String,
        status: ShiftStatus
    ) -> Shift {
        return Shift(
            id: id,
            clientId: "client-1",
            carerId: "carer-1",
            scheduledStart: Date(),
            scheduledEnd: Date().addingTimeInterval(3600 * 3),
            actualStart: nil,
            actualEnd: nil,
            status: status,
            notes: nil,
            carer: ShiftCarer(id: "carer-1", firstName: "Sarah", lastName: "Johnson"),
            client: ShiftClient(id: "client-1", firstName: "Margaret", lastName: "Thompson", address: "123 Oak St"),
            createdAt: Date(),
            updatedAt: Date()
        )
    }
}

// MARK: - Shift Filtering Tests

final class ShiftFilteringTests: XCTestCase {

    func testShiftIsToday() {
        let today = Date()
        let shift = createShift(scheduledStart: today)

        XCTAssertTrue(shift.isToday)
    }

    func testShiftIsTomorrow() {
        let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: Date())!
        let shift = createShift(scheduledStart: tomorrow)

        XCTAssertTrue(shift.isTomorrow)
        XCTAssertFalse(shift.isToday)
    }

    func testShiftIsFutureDate() {
        let futureDate = Calendar.current.date(byAdding: .day, value: 7, to: Date())!
        let shift = createShift(scheduledStart: futureDate)

        XCTAssertFalse(shift.isToday)
        XCTAssertFalse(shift.isTomorrow)
    }

    func testShiftDurationFormatting() {
        // 3 hours
        let start = Date()
        let end = start.addingTimeInterval(3600 * 3)
        let shift = createShift(scheduledStart: start, scheduledEnd: end)

        XCTAssertEqual(shift.durationFormatted, "3h")
    }

    func testShiftDurationFormattingWithMinutes() {
        // 2 hours 30 minutes
        let start = Date()
        let end = start.addingTimeInterval(3600 * 2 + 1800)
        let shift = createShift(scheduledStart: start, scheduledEnd: end)

        XCTAssertEqual(shift.durationFormatted, "2h 30m")
    }

    func testShiftTimeRangeFormatted() {
        let calendar = Calendar.current
        var components = DateComponents()
        components.hour = 9
        components.minute = 0
        let start = calendar.date(from: components)!

        components.hour = 12
        let end = calendar.date(from: components)!

        let shift = createShift(scheduledStart: start, scheduledEnd: end)

        XCTAssertTrue(shift.timeRangeFormatted.contains("9:00"))
        XCTAssertTrue(shift.timeRangeFormatted.contains("12:00"))
    }

    private func createShift(
        scheduledStart: Date,
        scheduledEnd: Date? = nil
    ) -> Shift {
        return Shift(
            id: "test-shift",
            clientId: "client-1",
            carerId: "carer-1",
            scheduledStart: scheduledStart,
            scheduledEnd: scheduledEnd ?? scheduledStart.addingTimeInterval(3600 * 3),
            actualStart: nil,
            actualEnd: nil,
            status: .scheduled,
            notes: nil,
            carer: nil,
            client: nil,
            createdAt: Date(),
            updatedAt: Date()
        )
    }
}

// MARK: - Client Age Tests

final class ClientAgeTests: XCTestCase {

    func testClientAgeCalculation() {
        let calendar = Calendar.current
        let birthDate = calendar.date(byAdding: .year, value: -75, to: Date())!

        let client = createClient(dateOfBirth: birthDate)

        XCTAssertNotNil(client.age)
        XCTAssertEqual(client.age, 75)
    }

    func testClientAgeWhenNoDateOfBirth() {
        let client = createClient(dateOfBirth: nil)

        XCTAssertNil(client.age)
    }

    func testClientFullName() {
        let client = createClient(firstName: "Margaret", lastName: "Thompson")

        XCTAssertEqual(client.fullName, "Margaret Thompson")
    }

    func testClientCareNeedsBackwardsCompatibility() {
        let client = createClient(medicalNotes: "Requires assistance with mobility")

        XCTAssertEqual(client.careNeeds, client.medicalNotes)
        XCTAssertEqual(client.careNeeds, "Requires assistance with mobility")
    }

    private func createClient(
        firstName: String = "Test",
        lastName: String = "Client",
        dateOfBirth: Date? = nil,
        medicalNotes: String? = nil
    ) -> Client {
        return Client(
            id: "test-client",
            firstName: firstName,
            lastName: lastName,
            dateOfBirth: dateOfBirth,
            phone: nil,
            email: nil,
            address: nil,
            status: .active,
            profileImageURL: nil,
            medicalNotes: medicalNotes,
            createdAt: Date(),
            updatedAt: Date(),
            sponsor: nil,
            assignedCarer: nil
        )
    }
}
