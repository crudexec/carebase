import Foundation

// MARK: - API Client
// Clean, type-safe networking layer for Carebase backend

class APIClient {
    static let shared = APIClient()

    /// Base URL for the API - configured in AppConfiguration
    private var baseURL: String {
        AppConfiguration.apiBaseURL
    }

    private let session: URLSession
    private var sessionCookie: String?

    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 60
        config.httpCookieAcceptPolicy = .always
        config.httpShouldSetCookies = true
        self.session = URLSession(configuration: config)
    }

    func setSessionCookie(_ cookie: String?) {
        self.sessionCookie = cookie
    }

    func getSessionCookie() -> String? {
        return sessionCookie
    }

    /// Merge new cookies from Set-Cookie header with existing cookies
    /// This preserves the session token when server sends only CSRF token updates
    private func updateSessionCookies(from setCookieHeader: String) {
        // Parse existing cookies into a dictionary
        var cookieDict: [String: String] = [:]
        if let existingCookies = sessionCookie {
            for cookie in existingCookies.split(separator: ";") {
                let parts = cookie.trimmingCharacters(in: .whitespaces).split(separator: "=", maxSplits: 1)
                if parts.count == 2 {
                    cookieDict[String(parts[0])] = String(parts[1])
                }
            }
        }

        // Parse new cookies and update/add to dictionary
        // Set-Cookie header may contain multiple cookies separated by commas (for different cookies)
        // or may be a single cookie with attributes separated by semicolons
        let newCookieParts = setCookieHeader.split(separator: ",")
        for cookiePart in newCookieParts {
            // Get the first part before any attributes (;)
            let cookieValue = cookiePart.split(separator: ";").first ?? cookiePart
            let keyValue = cookieValue.trimmingCharacters(in: .whitespaces).split(separator: "=", maxSplits: 1)
            if keyValue.count == 2 {
                let key = String(keyValue[0])
                let value = String(keyValue[1])
                cookieDict[key] = value
                #if DEBUG
                print("Cookie updated: \(key)=\(value.prefix(20))...")
                #endif
            }
        }

        // Rebuild cookie string
        let newCookieString = cookieDict.map { "\($0.key)=\($0.value)" }.joined(separator: "; ")
        self.sessionCookie = newCookieString

        // Persist to keychain
        KeychainManager.shared.saveSessionCookie(newCookieString)

        #if DEBUG
        print("Session cookies merged and saved. Keys: \(cookieDict.keys.joined(separator: ", "))")
        #endif
    }

    // MARK: - Generic Request
    func request<T: Decodable>(
        endpoint: APIEndpoint,
        method: HTTPMethod = .get,
        body: Encodable? = nil,
        queryParams: [String: String]? = nil
    ) async throws -> T {
        var urlComponents = URLComponents(string: "\(baseURL)\(endpoint.path)")!

        // Add query parameters
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

        // Add session cookie for authentication
        if let cookie = sessionCookie {
            request.setValue(cookie, forHTTPHeaderField: "Cookie")
            #if DEBUG
            print("Sending cookie: \(cookie.prefix(50))...")
            #endif
        } else {
            #if DEBUG
            print("WARNING: No session cookie available for request to \(endpoint.path)")
            #endif
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

        // Extract and update session cookie from response
        // Important: Merge new cookies with existing ones, don't replace entirely
        if let setCookieHeader = httpResponse.value(forHTTPHeaderField: "Set-Cookie") {
            updateSessionCookies(from: setCookieHeader)
        }

        // Debug logging
        #if DEBUG
        print("[\(method.rawValue)] \(url.absoluteString) -> \(httpResponse.statusCode)")
        if let jsonString = String(data: data, encoding: .utf8) {
            print("Response: \(jsonString.prefix(500))")
        }
        #endif

        switch httpResponse.statusCode {
        case 200...299:
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .custom { decoder in
                let container = try decoder.singleValueContainer()

                // Handle null values - return a distant past date that will be treated as nil by optional Date?
                if container.decodeNil() {
                    // This shouldn't happen for non-optional Date, but for optional Date?
                    // the decoder won't call this closure if the value is null
                    throw DecodingError.valueNotFound(Date.self, DecodingError.Context(codingPath: decoder.codingPath, debugDescription: "Date value is null"))
                }

                let dateString = try container.decode(String.self)

                // Try ISO8601 with fractional seconds
                let formatter = ISO8601DateFormatter()
                formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
                if let date = formatter.date(from: dateString) {
                    return date
                }

                // Try ISO8601 without fractional seconds
                formatter.formatOptions = [.withInternetDateTime]
                if let date = formatter.date(from: dateString) {
                    return date
                }

                throw DecodingError.dataCorruptedError(in: container, debugDescription: "Invalid date: \(dateString)")
            }
            do {
                return try decoder.decode(T.self, from: data)
            } catch {
                #if DEBUG
                print("Decoding Error: \(error)")
                if let jsonString = String(data: data, encoding: .utf8) {
                    print("Raw Response: \(jsonString)")
                }
                #endif
                throw error
            }
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

    // MARK: - NextAuth Login
    func login(email: String, password: String) async throws -> AuthSession {
        // NextAuth uses form-encoded POST to /api/auth/callback/credentials
        let url = URL(string: "\(baseURL)/api/auth/callback/credentials")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")

        // Get CSRF token first
        let csrfToken = try await getCSRFToken()

        let bodyParams = [
            "email": email,
            "password": password,
            "csrfToken": csrfToken,
            "json": "true"
        ]
        request.httpBody = bodyParams
            .map { "\($0.key)=\($0.value.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")" }
            .joined(separator: "&")
            .data(using: .utf8)

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        #if DEBUG
        print("Login response status: \(httpResponse.statusCode)")
        #endif

        // Store cookies from response
        if let cookies = HTTPCookieStorage.shared.cookies(for: url), !cookies.isEmpty {
            let cookieHeader = cookies.map { "\($0.name)=\($0.value)" }.joined(separator: "; ")
            self.sessionCookie = cookieHeader
            #if DEBUG
            print("Login: Stored \(cookies.count) cookies from storage")
            #endif
        } else {
            // Fallback: try to get from response headers
            if let setCookie = httpResponse.value(forHTTPHeaderField: "Set-Cookie") {
                self.sessionCookie = setCookie
                #if DEBUG
                print("Login: Stored cookie from Set-Cookie header")
                #endif
            } else {
                #if DEBUG
                print("Login: WARNING - No cookies found!")
                #endif
            }
        }

        if httpResponse.statusCode == 200 {
            // Get session to verify login and get user data
            return try await getSession()
        } else {
            let errorResponse = try? JSONDecoder().decode(ErrorResponse.self, from: data)
            throw APIError.loginFailed(errorResponse?.error ?? "Invalid credentials")
        }
    }

    // MARK: - Get CSRF Token
    private func getCSRFToken() async throws -> String {
        let url = URL(string: "\(baseURL)/api/auth/csrf")!
        var request = URLRequest(url: url)
        request.httpMethod = "GET"

        let (data, _) = try await session.data(for: request)

        struct CSRFResponse: Decodable {
            let csrfToken: String
        }

        let response = try JSONDecoder().decode(CSRFResponse.self, from: data)
        return response.csrfToken
    }

    // MARK: - Get Session
    func getSession() async throws -> AuthSession {
        let url = URL(string: "\(baseURL)/api/auth/session")!
        var request = URLRequest(url: url)
        request.httpMethod = "GET"

        if let cookie = sessionCookie {
            request.setValue(cookie, forHTTPHeaderField: "Cookie")
        }

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        // Store cookies from response
        if let cookies = HTTPCookieStorage.shared.cookies(for: url) {
            let cookieHeader = cookies.map { "\($0.name)=\($0.value)" }.joined(separator: "; ")
            self.sessionCookie = cookieHeader
        }

        if httpResponse.statusCode == 200 {
            let session = try JSONDecoder().decode(AuthSession.self, from: data)
            if session.user != nil {
                return session
            }
        }

        throw APIError.unauthorized
    }

    // MARK: - Logout
    func logout() async throws {
        let csrfToken = try await getCSRFToken()

        let url = URL(string: "\(baseURL)/api/auth/signout")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")

        if let cookie = sessionCookie {
            request.setValue(cookie, forHTTPHeaderField: "Cookie")
        }

        let bodyParams = ["csrfToken": csrfToken]
        request.httpBody = bodyParams
            .map { "\($0.key)=\($0.value)" }
            .joined(separator: "&")
            .data(using: .utf8)

        _ = try await session.data(for: request)

        // Clear session
        sessionCookie = nil
        HTTPCookieStorage.shared.removeCookies(since: Date.distantPast)
    }

    // MARK: - Upload File
    func uploadFile(
        fileData: Data,
        fileName: String,
        mimeType: String
    ) async throws -> UploadResponse {
        let url = URL(string: "\(baseURL)/api/uploads")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"

        let boundary = UUID().uuidString
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

        if let cookie = sessionCookie {
            request.setValue(cookie, forHTTPHeaderField: "Cookie")
        }

        var body = Data()
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"file\"; filename=\"\(fileName)\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: \(mimeType)\r\n\r\n".data(using: .utf8)!)
        body.append(fileData)
        body.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)

        request.httpBody = body

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw APIError.uploadFailed
        }

        return try JSONDecoder().decode(UploadResponse.self, from: data)
    }
}

// MARK: - HTTP Method
enum HTTPMethod: String {
    case get = "GET"
    case post = "POST"
    case put = "PUT"
    case patch = "PATCH"
    case delete = "DELETE"
}

// MARK: - API Endpoints
enum APIEndpoint {
    // Shifts (Scheduling)
    case shifts
    case shift(id: String)
    case checkIn(shiftId: String)
    case checkOut(shiftId: String)
    case caregivers
    case schedulingClients

    // Clients
    case clients
    case client(id: String)

    // Visit Notes
    case visitNotes
    case visitNote(id: String)
    case visitNoteComments(noteId: String)
    case formTemplates
    case enabledTemplates
    case starterTemplates

    // Notifications
    case notifications

    // Users
    case mentionableUsers

    // Staff
    case staff
    case staffMember(id: String)

    // Upload
    case upload

    // Dashboard
    case dashboardActivity

    // Incidents
    case incidents
    case incident(id: String)

    var path: String {
        switch self {
        // Shifts
        case .shifts: return "/api/scheduling"
        case .shift(let id): return "/api/scheduling/\(id)"
        case .checkIn(let id): return "/api/check-in/\(id)/check-in"
        case .checkOut(let id): return "/api/check-in/\(id)/check-out"
        case .caregivers: return "/api/scheduling/caregivers"
        case .schedulingClients: return "/api/scheduling/clients"

        // Clients
        case .clients: return "/api/clients"
        case .client(let id): return "/api/clients/\(id)"

        // Visit Notes
        case .visitNotes: return "/api/visit-notes"
        case .visitNote(let id): return "/api/visit-notes/\(id)"
        case .visitNoteComments(let id): return "/api/visit-notes/\(id)/comments"
        case .formTemplates: return "/api/visit-notes/templates"
        case .enabledTemplates: return "/api/visit-notes/templates/enabled"
        case .starterTemplates: return "/api/visit-notes/templates/starters"

        // Notifications
        case .notifications: return "/api/notifications"

        // Users
        case .mentionableUsers: return "/api/users/mentionable"

        // Staff
        case .staff: return "/api/staff"
        case .staffMember(let id): return "/api/staff/\(id)"

        // Upload
        case .upload: return "/api/uploads"

        // Dashboard
        case .dashboardActivity: return "/api/dashboard/activity"

        // Incidents
        case .incidents: return "/api/incidents"
        case .incident(let id): return "/api/incidents/\(id)"
        }
    }
}

// MARK: - API Errors
enum APIError: Error, LocalizedError {
    case invalidURL
    case invalidResponse
    case unauthorized
    case forbidden
    case notFound
    case validationError(String)
    case serverError
    case uploadFailed
    case loginFailed(String)
    case unknown(Int)
    case networkError(Error)

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid response from server"
        case .unauthorized:
            return "Please sign in to continue"
        case .forbidden:
            return "You don't have permission to access this"
        case .notFound:
            return "The requested resource was not found"
        case .validationError(let message):
            return message
        case .serverError:
            return "Something went wrong. Please try again."
        case .uploadFailed:
            return "Failed to upload file"
        case .loginFailed(let message):
            return message
        case .unknown(let code):
            return "An error occurred (Code: \(code))"
        case .networkError:
            return "Network connection error. Please check your connection."
        }
    }
}

// MARK: - Response Types
struct ErrorResponse: Decodable {
    let error: String
    let details: [ValidationError]?
}

struct ValidationError: Decodable {
    let field: String?
    let message: String
}

struct UploadResponse: Decodable {
    let url: String
    let fileName: String
    let fileSize: Int
}

// MARK: - Auth Session
struct AuthSession: Decodable {
    let user: SessionUser?
    let expires: String?
}

struct SessionUser: Decodable {
    let id: String
    let email: String
    let firstName: String
    let lastName: String
    let role: String
    let companyId: String
}
