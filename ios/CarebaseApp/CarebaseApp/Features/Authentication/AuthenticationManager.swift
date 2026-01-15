import Foundation
import SwiftUI
import Security

// MARK: - Authentication Manager
// Uses NextAuth session-based authentication with cookies
@MainActor
class AuthenticationManager: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var isLoading = false
    @Published var error: String?

    private let keychain = KeychainManager.shared
    private let api = APIClient.shared

    init() {
        // Check for existing session on launch
        Task {
            await checkExistingSession()
        }
    }

    // MARK: - Check Existing Session
    func checkExistingSession() async {
        // Restore session cookie if we have one
        if let savedCookie = keychain.getSessionCookie() {
            api.setSessionCookie(savedCookie)
            #if DEBUG
            print("AuthManager: Restored session cookie from keychain: \(savedCookie.prefix(50))...")
            #endif
        } else {
            #if DEBUG
            print("AuthManager: No session cookie found in keychain")
            #endif
        }

        isLoading = true

        do {
            let session = try await api.getSession()
            if let sessionUser = session.user {
                currentUser = User(from: sessionUser)
                isAuthenticated = true
            } else {
                isAuthenticated = false
            }
        } catch {
            // Session invalid or expired
            keychain.deleteSessionCookie()
            api.setSessionCookie(nil)
            isAuthenticated = false
        }

        isLoading = false
    }

    // MARK: - Login
    func login(email: String, password: String) async {
        isLoading = true
        error = nil

        // Demo mode for testing without backend
        if AppConfiguration.isDemoMode {
            try? await Task.sleep(nanoseconds: 800_000_000)

            currentUser = User(
                id: "demo-user-1",
                email: email,
                firstName: "Sarah",
                lastName: "Johnson",
                role: .carer,
                phone: "555-0100",
                profileImageURL: nil,
                isActive: true,
                companyId: "demo-company",
                createdAt: Date(),
                updatedAt: Date()
            )
            isAuthenticated = true
            isLoading = false
            HapticType.success.trigger()
            return
        }

        do {
            // Use NextAuth login flow
            let session = try await api.login(email: email, password: password)

            if let sessionUser = session.user {
                currentUser = User(from: sessionUser)
                isAuthenticated = true

                // Save session cookie for persistence
                if let cookie = api.getSessionCookie() {
                    keychain.saveSessionCookie(cookie)
                    #if DEBUG
                    print("AuthManager: Saved session cookie to keychain after login")
                    #endif
                } else {
                    #if DEBUG
                    print("AuthManager: WARNING - No session cookie to save after login!")
                    #endif
                }

                HapticType.success.trigger()
            } else {
                error = "Login failed - no user in session"
                HapticType.error.trigger()
            }
        } catch let apiError as APIError {
            error = apiError.errorDescription
            HapticType.error.trigger()
        } catch {
            self.error = "An unexpected error occurred"
            HapticType.error.trigger()
        }

        isLoading = false
    }

    // MARK: - Logout
    func logout() async {
        isLoading = true

        // Call NextAuth signout
        try? await api.logout()

        // Clear local state
        keychain.deleteSessionCookie()
        currentUser = nil
        isAuthenticated = false
        isLoading = false

        HapticType.light.trigger()
    }

    // MARK: - Refresh Session
    func refreshSession() async {
        do {
            let session = try await api.getSession()
            if let sessionUser = session.user {
                currentUser = User(from: sessionUser)
                isAuthenticated = true
            } else {
                await logout()
            }
        } catch {
            await logout()
        }
    }
}

// MARK: - Keychain Manager
class KeychainManager {
    static let shared = KeychainManager()

    private let sessionCookieKey = "com.carebase.sessionCookie"

    private init() {}

    func saveSessionCookie(_ cookie: String) {
        let data = cookie.data(using: .utf8)!

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: sessionCookieKey,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        ]

        // Delete any existing item
        SecItemDelete(query as CFDictionary)

        // Add new item
        SecItemAdd(query as CFDictionary, nil)
    }

    func getSessionCookie() -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: sessionCookieKey,
            kSecReturnData as String: true
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess,
              let data = result as? Data,
              let cookie = String(data: data, encoding: .utf8) else {
            return nil
        }

        return cookie
    }

    func deleteSessionCookie() {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: sessionCookieKey
        ]

        SecItemDelete(query as CFDictionary)
    }
}
