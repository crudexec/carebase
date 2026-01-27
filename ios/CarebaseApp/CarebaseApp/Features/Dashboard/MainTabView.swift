import SwiftUI

// MARK: - Main Tab View
// Clean, intuitive navigation
// Tabs are role-based: carers see shifts, sponsors see their clients' care details

struct MainTabView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @EnvironmentObject var appState: AppState

    @State private var selectedTab: Tab = .home

    // Check if current user is a sponsor
    private var isSponsor: Bool {
        authManager.currentUser?.role == .sponsor
    }

    enum Tab: String, CaseIterable {
        case home = "Home"
        case shifts = "Shifts"
        case clients = "Clients"
        case myClients = "My Clients"
        case visitNotes = "Visit Notes"
        case incidents = "Incidents"
        case profile = "Profile"

        var icon: String {
            switch self {
            case .home: return "house.fill"
            case .shifts: return "calendar"
            case .clients: return "person.2.fill"
            case .myClients: return "heart.fill"
            case .visitNotes: return "doc.text"
            case .incidents: return "exclamationmark.shield"
            case .profile: return "person.circle.fill"
            }
        }

        var selectedIcon: String {
            switch self {
            case .home: return "house.fill"
            case .shifts: return "calendar.badge.clock"
            case .clients: return "person.2.fill"
            case .myClients: return "heart.fill"
            case .visitNotes: return "doc.text.fill"
            case .incidents: return "exclamationmark.shield.fill"
            case .profile: return "person.circle.fill"
            }
        }
    }

    var body: some View {
        TabView(selection: $selectedTab) {
            if isSponsor {
                // MARK: - Sponsor Tabs
                SponsorDashboardView()
                    .tag(Tab.home)
                    .tabItem {
                        Label(Tab.home.rawValue, systemImage: selectedTab == .home ? Tab.home.selectedIcon : Tab.home.icon)
                    }

                SponsorClientsView()
                    .tag(Tab.myClients)
                    .tabItem {
                        Label(Tab.myClients.rawValue, systemImage: selectedTab == .myClients ? Tab.myClients.selectedIcon : Tab.myClients.icon)
                    }

                SponsorVisitNotesView()
                    .tag(Tab.visitNotes)
                    .tabItem {
                        Label(Tab.visitNotes.rawValue, systemImage: selectedTab == .visitNotes ? Tab.visitNotes.selectedIcon : Tab.visitNotes.icon)
                    }

                IncidentsListView()
                    .tag(Tab.incidents)
                    .tabItem {
                        Label(Tab.incidents.rawValue, systemImage: selectedTab == .incidents ? Tab.incidents.selectedIcon : Tab.incidents.icon)
                    }

                ProfileView()
                    .tag(Tab.profile)
                    .tabItem {
                        Label(Tab.profile.rawValue, systemImage: selectedTab == .profile ? Tab.profile.selectedIcon : Tab.profile.icon)
                    }
            } else {
                // MARK: - Carer/Staff Tabs
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

                IncidentsListView()
                    .tag(Tab.incidents)
                    .tabItem {
                        Label(Tab.incidents.rawValue, systemImage: selectedTab == .incidents ? Tab.incidents.selectedIcon : Tab.incidents.icon)
                    }

                ProfileView()
                    .tag(Tab.profile)
                    .tabItem {
                        Label(Tab.profile.rawValue, systemImage: selectedTab == .profile ? Tab.profile.selectedIcon : Tab.profile.icon)
                    }
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
