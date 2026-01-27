import SwiftUI

@main
struct CarebaseApp: App {
    @StateObject private var authManager = AuthenticationManager()
    @StateObject private var appState = AppState()

    var body: some Scene {
        WindowGroup {
            Group {
                if authManager.isLoading {
                    // Show splash/loading screen while checking session
                    ZStack {
                        Color.Carebase.background
                            .ignoresSafeArea()
                        VStack(spacing: 16) {
                            Image(systemName: "heart.circle.fill")
                                .font(.system(size: 64))
                                .foregroundColor(Color.Carebase.accent)
                            Text("Carebase")
                                .font(.title)
                                .fontWeight(.bold)
                                .foregroundColor(Color.Carebase.textPrimary)
                            ProgressView()
                                .tint(Color.Carebase.accent)
                        }
                    }
                } else if authManager.isAuthenticated {
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
