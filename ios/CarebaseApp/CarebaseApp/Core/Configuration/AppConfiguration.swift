import Foundation

// MARK: - App Configuration
// Centralized configuration for the app
// Configure these values for your environment

struct AppConfiguration {
    // MARK: - API Configuration

    /// The base URL for the Carebase API
    /// Options:
    /// - Local development: http://localhost:3000
    /// - Production: https://your-domain.com
    ///
    /// This can also be set via the API_BASE_URL environment variable
    static var apiBaseURL: String {
        // Check for environment variable first (useful for different build configurations)
        if let envURL = ProcessInfo.processInfo.environment["API_BASE_URL"] {
            return envURL
        }

        #if DEBUG
        // Development URL - change this to your local backend URL
        return "http://localhost:3000"
        #else
        // Production URL - change this to your production backend URL
        return "https://api.carebase.com"
        #endif
    }

    // MARK: - Feature Flags

    /// Enable demo mode (bypasses real authentication)
    static var isDemoMode: Bool {
        #if DEBUG
        return false // Set to true to enable demo mode without backend
        #else
        return false
        #endif
    }

    // MARK: - App Info

    static var appVersion: String {
        Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
    }

    static var buildNumber: String {
        Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
    }

    static var fullVersion: String {
        "\(appVersion) (\(buildNumber))"
    }
}

// MARK: - Environment
enum AppEnvironment {
    case development
    case staging
    case production

    static var current: AppEnvironment {
        #if DEBUG
        return .development
        #else
        return .production
        #endif
    }
}
