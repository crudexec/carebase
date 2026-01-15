import SwiftUI

// MARK: - Clients List View
// Quick access to all assigned clients
// Easy search and contact

struct ClientsListView: View {
    @StateObject private var viewModel = ClientsViewModel()
    @State private var searchText = ""

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading && viewModel.clients.isEmpty {
                    LoadingView()
                } else if filteredClients.isEmpty {
                    EmptyClientsView(hasSearch: !searchText.isEmpty)
                } else {
                    ClientsList(clients: filteredClients)
                }
            }
            .background(Color.Carebase.backgroundSecondary)
            .navigationTitle("Clients")
            .navigationBarTitleDisplayMode(.large)
            .searchable(text: $searchText, prompt: "Search clients...")
            .refreshable {
                await viewModel.refresh()
            }
        }
        .task {
            await viewModel.loadClients()
        }
    }

    private var filteredClients: [Client] {
        if searchText.isEmpty {
            return viewModel.clients
        }
        return viewModel.clients.filter { client in
            client.fullName.localizedCaseInsensitiveContains(searchText) ||
            client.address?.localizedCaseInsensitiveContains(searchText) == true
        }
    }
}

// MARK: - Clients List
struct ClientsList: View {
    let clients: [Client]

    var body: some View {
        ScrollView {
            LazyVStack(spacing: Spacing.sm) {
                ForEach(clients) { client in
                    NavigationLink(destination: ClientDetailView(clientId: client.id)) {
                        ClientRow(client: client)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, Spacing.screenHorizontal)
            .padding(.vertical, Spacing.md)
        }
    }
}

// MARK: - Client Row
struct ClientRow: View {
    let client: Client

    var body: some View {
        CarebaseCard {
            HStack(spacing: Spacing.md) {
                Avatar(name: client.fullName, size: 56)

                VStack(alignment: .leading, spacing: Spacing.xxs) {
                    Text(client.fullName)
                        .font(.Carebase.headlineSmall)
                        .foregroundColor(Color.Carebase.textPrimary)

                    if let address = client.address {
                        HStack(spacing: Spacing.xxs) {
                            Image(systemName: "mappin")
                                .font(.system(size: 10))
                            Text(address)
                        }
                        .font(.Carebase.bodySmall)
                        .foregroundColor(Color.Carebase.textSecondary)
                        .lineLimit(1)
                    }

                    StatusBadge(
                        client.status.displayName,
                        color: statusColor(for: client.status),
                        size: .small
                    )
                }

                Spacer()

                VStack(spacing: Spacing.xs) {
                    if let phone = client.phone {
                        Button(action: { callClient(phone) }) {
                            Image(systemName: "phone.fill")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(Color.Carebase.success)
                                .frame(width: 36, height: 36)
                                .background(Color.Carebase.successSoft)
                                .clipShape(Circle())
                        }
                    }

                    Image(systemName: "chevron.right")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(Color.Carebase.textTertiary)
                }
            }
        }
    }

    private func statusColor(for status: ClientStatus) -> Color {
        switch status {
        case .active: return Color.Carebase.success
        case .onboarding: return Color.Carebase.warning
        case .prospect: return Color.Carebase.info
        case .inactive: return Color.Carebase.textTertiary
        }
    }

    private func callClient(_ phone: String) {
        if let url = URL(string: "tel://\(phone)") {
            UIApplication.shared.open(url)
        }
    }
}

// MARK: - Empty Clients View
struct EmptyClientsView: View {
    let hasSearch: Bool

    var body: some View {
        VStack(spacing: Spacing.lg) {
            Spacer()

            Image(systemName: hasSearch ? "magnifyingglass" : "person.2")
                .font(.system(size: 64, weight: .light))
                .foregroundColor(Color.Carebase.textTertiary)

            VStack(spacing: Spacing.xs) {
                Text(hasSearch ? "No results" : "No clients")
                    .font(.Carebase.headlineMedium)
                    .foregroundColor(Color.Carebase.textPrimary)

                Text(hasSearch ? "Try a different search term" : "You don't have any assigned clients yet.")
                    .font(.Carebase.bodyMedium)
                    .foregroundColor(Color.Carebase.textSecondary)
                    .multilineTextAlignment(.center)
            }

            Spacer()
        }
        .padding()
    }
}

// MARK: - Client Detail View
struct ClientDetailView: View {
    let clientId: String
    @StateObject private var viewModel = ClientDetailViewModel()

    var body: some View {
        ScrollView {
            if let client = viewModel.client {
                VStack(spacing: Spacing.xl) {
                    // Profile Header
                    ClientProfileHeader(client: client)

                    // Quick Actions
                    ClientQuickActions(client: client)

                    // Medical Notes / Care Needs
                    if let medicalNotes = client.medicalNotes {
                        CareNeedsSection(careNeeds: medicalNotes)
                    }

                    // Contact Info
                    ContactInfoSection(client: client)

                    // Sponsor Info
                    if let sponsor = client.sponsor {
                        SponsorSection(sponsor: sponsor)
                    }

                    // Address
                    if let address = client.address {
                        AddressSectionSimple(address: address)
                    }
                }
                .padding(.vertical, Spacing.lg)
            } else if viewModel.isLoading {
                LoadingView()
            } else if let error = viewModel.error {
                ErrorStateView(message: error) {
                    Task { await viewModel.loadClient(id: clientId) }
                }
            }
        }
        .background(Color.Carebase.backgroundSecondary)
        .navigationTitle("Client Profile")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await viewModel.loadClient(id: clientId)
        }
    }
}

// MARK: - Client Profile Header
struct ClientProfileHeader: View {
    let client: Client

    var body: some View {
        VStack(spacing: Spacing.md) {
            Avatar(name: client.fullName, size: 100)

            VStack(spacing: Spacing.xs) {
                Text(client.fullName)
                    .font(.Carebase.displaySmall)
                    .foregroundColor(Color.Carebase.textPrimary)

                if let age = client.age {
                    Text("\(age) years old")
                        .font(.Carebase.bodyMedium)
                        .foregroundColor(Color.Carebase.textSecondary)
                }

                StatusBadge(
                    client.status.displayName,
                    color: client.status == .active ? Color.Carebase.success : Color.Carebase.warning
                )
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, Spacing.lg)
        .background(Color.Carebase.surface)
    }
}

// MARK: - Client Quick Actions
struct ClientQuickActions: View {
    let client: Client

    var body: some View {
        HStack(spacing: Spacing.md) {
            if let phone = client.phone {
                QuickActionButton(
                    icon: "phone.fill",
                    title: "Call",
                    color: Color.Carebase.success
                ) {
                    if let url = URL(string: "tel://\(phone)") {
                        UIApplication.shared.open(url)
                    }
                }
            }

            if let address = client.address {
                QuickActionButton(
                    icon: "map.fill",
                    title: "Directions",
                    color: Color.Carebase.info
                ) {
                    if let encoded = address.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
                       let url = URL(string: "maps://?address=\(encoded)") {
                        UIApplication.shared.open(url)
                    }
                }
            }

            QuickActionButton(
                icon: "doc.text.fill",
                title: "Notes",
                color: Color.Carebase.accent
            ) {
                // Navigate to notes
            }
        }
        .screenPadding()
    }
}

// MARK: - Care Needs Section
struct CareNeedsSection: View {
    let careNeeds: String

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            Text("Care Needs")
                .font(.Carebase.labelMedium)
                .foregroundColor(Color.Carebase.textSecondary)
                .screenPadding()

            CarebaseCard {
                Text(careNeeds)
                    .font(.Carebase.bodyMedium)
                    .foregroundColor(Color.Carebase.textPrimary)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .screenPadding()
        }
    }
}

// MARK: - Contact Info Section
struct ContactInfoSection: View {
    let client: Client

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            Text("Contact Information")
                .font(.Carebase.labelMedium)
                .foregroundColor(Color.Carebase.textSecondary)
                .screenPadding()

            CarebaseCard {
                VStack(spacing: Spacing.md) {
                    if let phone = client.phone {
                        ContactRow(icon: "phone.fill", label: "Phone", value: phone)
                    }

                    if let email = client.email {
                        ContactRow(icon: "envelope.fill", label: "Email", value: email)
                    }
                }
            }
            .screenPadding()
        }
    }
}

struct ContactRow: View {
    let icon: String
    let label: String
    let value: String

    var body: some View {
        HStack(spacing: Spacing.md) {
            Image(systemName: icon)
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(Color.Carebase.accent)
                .frame(width: 36, height: 36)
                .background(Color.Carebase.accentSoft)
                .clipShape(Circle())

            VStack(alignment: .leading, spacing: Spacing.xxs) {
                Text(label)
                    .font(.Carebase.caption)
                    .foregroundColor(Color.Carebase.textTertiary)
                Text(value)
                    .font(.Carebase.bodyMedium)
                    .foregroundColor(Color.Carebase.textPrimary)
            }

            Spacer()
        }
    }
}

// MARK: - Emergency Contact Section
struct EmergencyContactSection: View {
    let contact: EmergencyContact

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            Text("Emergency Contact")
                .font(.Carebase.labelMedium)
                .foregroundColor(Color.Carebase.textSecondary)
                .screenPadding()

            CarebaseCard(backgroundColor: Color.Carebase.errorSoft.opacity(0.3)) {
                HStack(spacing: Spacing.md) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .font(.system(size: 20, weight: .medium))
                        .foregroundColor(Color.Carebase.error)
                        .frame(width: 44, height: 44)
                        .background(Color.Carebase.errorSoft)
                        .clipShape(Circle())

                    VStack(alignment: .leading, spacing: Spacing.xxs) {
                        Text(contact.name)
                            .font(.Carebase.headlineSmall)
                            .foregroundColor(Color.Carebase.textPrimary)

                        Text(contact.relationship)
                            .font(.Carebase.bodySmall)
                            .foregroundColor(Color.Carebase.textSecondary)

                        Text(contact.phone)
                            .font(.Carebase.bodyMedium)
                            .foregroundColor(Color.Carebase.accent)
                    }

                    Spacer()

                    Button(action: {
                        if let url = URL(string: "tel://\(contact.phone)") {
                            UIApplication.shared.open(url)
                        }
                    }) {
                        Image(systemName: "phone.fill")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.white)
                            .frame(width: 44, height: 44)
                            .background(Color.Carebase.error)
                            .clipShape(Circle())
                    }
                }
            }
            .screenPadding()
        }
    }
}

// MARK: - Address Section (Simple string)
struct AddressSectionSimple: View {
    let address: String

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            Text("Address")
                .font(.Carebase.labelMedium)
                .foregroundColor(Color.Carebase.textSecondary)
                .screenPadding()

            CarebaseCard {
                HStack(spacing: Spacing.md) {
                    Image(systemName: "mappin.circle.fill")
                        .font(.system(size: 20, weight: .medium))
                        .foregroundColor(Color.Carebase.info)
                        .frame(width: 44, height: 44)
                        .background(Color.Carebase.infoSoft)
                        .clipShape(Circle())

                    Text(address)
                        .font(.Carebase.bodyMedium)
                        .foregroundColor(Color.Carebase.textPrimary)
                        .frame(maxWidth: .infinity, alignment: .leading)

                    Spacer()
                }
            }
            .screenPadding()
        }
    }
}

// MARK: - Sponsor Section
struct SponsorSection: View {
    let sponsor: ClientSponsor

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            Text("Family Contact")
                .font(.Carebase.labelMedium)
                .foregroundColor(Color.Carebase.textSecondary)
                .screenPadding()

            CarebaseCard(backgroundColor: Color.Carebase.accentSoft.opacity(0.3)) {
                HStack(spacing: Spacing.md) {
                    Image(systemName: "person.2.fill")
                        .font(.system(size: 20, weight: .medium))
                        .foregroundColor(Color.Carebase.accent)
                        .frame(width: 44, height: 44)
                        .background(Color.Carebase.accentSoft)
                        .clipShape(Circle())

                    VStack(alignment: .leading, spacing: Spacing.xxs) {
                        Text(sponsor.fullName)
                            .font(.Carebase.headlineSmall)
                            .foregroundColor(Color.Carebase.textPrimary)

                        Text("Family Member")
                            .font(.Carebase.bodySmall)
                            .foregroundColor(Color.Carebase.textSecondary)
                    }

                    Spacer()
                }
            }
            .screenPadding()
        }
    }
}

// MARK: - Error State View
struct ErrorStateView: View {
    let message: String
    let retryAction: () -> Void

    var body: some View {
        VStack(spacing: Spacing.lg) {
            Spacer()

            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 64, weight: .light))
                .foregroundColor(Color.Carebase.error)

            VStack(spacing: Spacing.xs) {
                Text("Something went wrong")
                    .font(.Carebase.headlineMedium)
                    .foregroundColor(Color.Carebase.textPrimary)

                Text(message)
                    .font(.Carebase.bodyMedium)
                    .foregroundColor(Color.Carebase.textSecondary)
                    .multilineTextAlignment(.center)
            }

            CarebaseButton("Try Again", style: .secondary) {
                retryAction()
            }

            Spacer()
        }
        .padding()
    }
}

// MARK: - View Models
@MainActor
class ClientsViewModel: ObservableObject {
    @Published var clients: [Client] = []
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIClient.shared

    func loadClients() async {
        isLoading = true
        error = nil

        do {
            let response: ClientsResponse = try await api.request(endpoint: .clients)
            self.clients = response.clients
        } catch let apiError as APIError {
            self.error = apiError.errorDescription
        } catch {
            self.error = "Failed to load clients"
        }

        isLoading = false
    }

    func refresh() async {
        await loadClients()
    }
}

@MainActor
class ClientDetailViewModel: ObservableObject {
    @Published var client: Client?
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIClient.shared

    func loadClient(id: String) async {
        isLoading = true
        error = nil

        do {
            let response: ClientResponse = try await api.request(endpoint: .client(id: id))
            self.client = response.client
        } catch let apiError as APIError {
            self.error = apiError.errorDescription
            #if DEBUG
            print("API Error loading client: \(apiError)")
            #endif
        } catch let decodingError as DecodingError {
            #if DEBUG
            print("Decoding Error loading client: \(decodingError)")
            #endif
            self.error = "Failed to parse client data"
        } catch {
            #if DEBUG
            print("Unknown Error loading client: \(error)")
            #endif
            self.error = "Failed to load client"
        }

        isLoading = false
    }
}

#Preview {
    ClientsListView()
}
