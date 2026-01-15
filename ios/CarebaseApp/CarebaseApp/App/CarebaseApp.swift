import SwiftUI

@main
struct CarebaseApp: App {
    @StateObject private var authManager = AuthenticationManager()
    @StateObject private var appState = AppState()

    var body: some Scene {
        WindowGroup {
            Group {
                if authManager.isAuthenticated {
                    MainTabView()
                        .environmentObject(authManager)
                        .environmentObject(appState)
                } else {
                    AuthenticationView()
                        .environmentObject(authManager)
                }
            }
            .preferredColorScheme(appState.colorScheme)
        }
    }
}

// MARK: - App State
class AppState: ObservableObject {
    @Published var colorScheme: ColorScheme? = nil
    @Published var hasUnreadNotifications: Bool = false
    @Published var activeShift: Shift? = nil
}
