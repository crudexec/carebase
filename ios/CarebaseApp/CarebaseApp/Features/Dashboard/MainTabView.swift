import SwiftUI

// MARK: - Main Tab View
// Clean, intuitive navigation
// Each tab is purposefully designed for the carer's workflow

struct MainTabView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @EnvironmentObject var appState: AppState

    @State private var selectedTab: Tab = .home

    enum Tab: String, CaseIterable {
        case home = "Home"
        case shifts = "Shifts"
        case clients = "Clients"
        case notes = "Notes"
        case profile = "Profile"

        var icon: String {
            switch self {
            case .home: return "house.fill"
            case .shifts: return "calendar"
            case .clients: return "person.2.fill"
            case .notes: return "doc.text.fill"
            case .profile: return "person.circle.fill"
            }
        }

        var selectedIcon: String {
            switch self {
            case .home: return "house.fill"
            case .shifts: return "calendar.badge.clock"
            case .clients: return "person.2.fill"
            case .notes: return "doc.text.fill"
            case .profile: return "person.circle.fill"
            }
        }
    }

    var body: some View {
        TabView(selection: $selectedTab) {
            DashboardView()
                .tag(Tab.home)
                .tabItem {
                    Label(Tab.home.rawValue, systemImage: selectedTab == .home ? Tab.home.selectedIcon : Tab.home.icon)
                }

            ShiftsView()
                .tag(Tab.shifts)
                .tabItem {
                    Label(Tab.shifts.rawValue, systemImage: selectedTab == .shifts ? Tab.shifts.selectedIcon : Tab.shifts.icon)
                }

            ClientsListView()
                .tag(Tab.clients)
                .tabItem {
                    Label(Tab.clients.rawValue, systemImage: selectedTab == .clients ? Tab.clients.selectedIcon : Tab.clients.icon)
                }

            VisitNotesListView()
                .tag(Tab.notes)
                .tabItem {
                    Label(Tab.notes.rawValue, systemImage: selectedTab == .notes ? Tab.notes.selectedIcon : Tab.notes.icon)
                }

            ProfileView()
                .tag(Tab.profile)
                .tabItem {
                    Label(Tab.profile.rawValue, systemImage: selectedTab == .profile ? Tab.profile.selectedIcon : Tab.profile.icon)
                }
        }
        .tint(Color.Carebase.accent)
        .onChange(of: selectedTab) { _, _ in
            HapticType.selection.trigger()
        }
    }
}

#Preview {
    MainTabView()
        .environmentObject(AuthenticationManager())
        .environmentObject(AppState())
}
