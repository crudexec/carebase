import SwiftUI

// MARK: - Sponsor Dashboard View
// Shows overview of sponsor's clients and recent care activities

struct SponsorDashboardView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var clients: [Client] = []
    @State private var recentVisitNotes: [VisitNote] = []
    @State private var isLoading = true
    @State private var error: String?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: Spacing.lg) {
                    // Welcome Header
                    welcomeHeader

                    if isLoading {
                        loadingView
                    } else if let error = error {
                        errorView(error)
                    } else {
                        // Clients Summary
                        clientsSummarySection

                        // Recent Visit Notes
                        recentVisitNotesSection
                    }
                }
                .padding()
            }
            .background(Color.Carebase.background)
            .navigationTitle("Home")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        Task { await fetchData() }
                    } label: {
                        Image(systemName: "arrow.clockwise")
                    }
                }
            }
            .refreshable {
                await fetchData(isRefresh: true)
            }
        }
        .task {
            await fetchData()
        }
    }

    // MARK: - Welcome Header

    private var welcomeHeader: some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            Text(greeting)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(Color.Carebase.textPrimary)

            Text("Here's how your loved ones are doing")
                .font(.subheadline)
                .foregroundColor(Color.Carebase.textSecondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color.Carebase.surface)
        .cornerRadius(12)
    }

    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        let name = authManager.currentUser?.firstName ?? "there"

        switch hour {
        case 0..<12:
            return "Good morning, \(name)"
        case 12..<17:
            return "Good afternoon, \(name)"
        default:
            return "Good evening, \(name)"
        }
    }

    // MARK: - Loading View

    private var loadingView: some View {
        VStack(spacing: Spacing.md) {
            ProgressView()
            Text("Loading...")
                .font(.subheadline)
                .foregroundColor(Color.Carebase.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, Spacing.xl)
    }

    // MARK: - Error View

    private func errorView(_ message: String) -> some View {
        VStack(spacing: Spacing.md) {
            Image(systemName: "exclamationmark.triangle")
                .font(.largeTitle)
                .foregroundColor(.orange)
            Text(message)
                .foregroundColor(Color.Carebase.textSecondary)
            Button("Try Again") {
                Task { await fetchData() }
            }
            .buttonStyle(.bordered)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, Spacing.xl)
    }

    // MARK: - Clients Summary Section

    private var clientsSummarySection: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            HStack {
                Text("Your Clients")
                    .font(.headline)
                    .foregroundColor(Color.Carebase.textPrimary)
                Spacer()
                Text("\(clients.count)")
                    .font(.subheadline)
                    .foregroundColor(Color.Carebase.textSecondary)
            }

            if clients.isEmpty {
                emptyClientsView
            } else {
                ForEach(clients) { client in
                    SponsorClientCard(client: client)
                }
            }
        }
        .padding()
        .background(Color.Carebase.surface)
        .cornerRadius(12)
    }

    private var emptyClientsView: some View {
        VStack(spacing: Spacing.sm) {
            Image(systemName: "person.crop.circle.badge.questionmark")
                .font(.system(size: 40))
                .foregroundColor(Color.Carebase.textTertiary)
            Text("No clients associated")
                .font(.subheadline)
                .foregroundColor(Color.Carebase.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, Spacing.lg)
    }

    // MARK: - Recent Visit Notes Section

    private var recentVisitNotesSection: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            HStack {
                Text("Recent Care Notes")
                    .font(.headline)
                    .foregroundColor(Color.Carebase.textPrimary)
                Spacer()
                NavigationLink(destination: SponsorVisitNotesView()) {
                    Text("View All")
                        .font(.subheadline)
                        .foregroundColor(Color.Carebase.accent)
                }
            }

            if recentVisitNotes.isEmpty {
                emptyVisitNotesView
            } else {
                ForEach(recentVisitNotes.prefix(5)) { note in
                    SponsorVisitNoteCard(visitNote: note)
                }
            }
        }
        .padding()
        .background(Color.Carebase.surface)
        .cornerRadius(12)
    }

    private var emptyVisitNotesView: some View {
        VStack(spacing: Spacing.sm) {
            Image(systemName: "doc.text")
                .font(.system(size: 40))
                .foregroundColor(Color.Carebase.textTertiary)
            Text("No recent care notes")
                .font(.subheadline)
                .foregroundColor(Color.Carebase.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, Spacing.lg)
    }

    // MARK: - Data Fetching

    private func fetchData(isRefresh: Bool = false) async {
        if !isRefresh {
            isLoading = true
        }
        error = nil

        do {
            // Fetch sponsor's clients
            let clientsResponse: ClientsResponse = try await APIClient.shared.request(
                endpoint: .clients,
                method: .get
            )

            // Fetch recent visit notes
            let visitNotesResponse: VisitNotesResponse = try await APIClient.shared.request(
                endpoint: .visitNotes,
                method: .get
            )

            await MainActor.run {
                clients = clientsResponse.clients
                recentVisitNotes = visitNotesResponse.visitNotes
                isLoading = false
            }
        } catch let apiError as APIError {
            await MainActor.run {
                if clients.isEmpty {
                    error = apiError.errorDescription ?? "Failed to load data"
                }
                isLoading = false
            }
        } catch {
            await MainActor.run {
                if clients.isEmpty {
                    self.error = "Failed to load data"
                }
                isLoading = false
            }
        }
    }
}

// MARK: - Sponsor Client Card

struct SponsorClientCard: View {
    let client: Client

    var body: some View {
        HStack(spacing: Spacing.md) {
            // Avatar
            Circle()
                .fill(Color.Carebase.accent.opacity(0.2))
                .frame(width: 50, height: 50)
                .overlay(
                    Text(client.initials)
                        .font(.headline)
                        .fontWeight(.semibold)
                        .foregroundColor(Color.Carebase.accent)
                )

            // Client Info
            VStack(alignment: .leading, spacing: Spacing.xs) {
                Text(client.fullName)
                    .font(.headline)
                    .foregroundColor(Color.Carebase.textPrimary)

                if let address = client.address, !address.isEmpty {
                    HStack(spacing: 4) {
                        Image(systemName: "location.fill")
                            .font(.caption2)
                        Text(address)
                            .font(.caption)
                    }
                    .foregroundColor(Color.Carebase.textSecondary)
                    .lineLimit(1)
                }
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundColor(Color.Carebase.textTertiary)
        }
        .padding()
        .background(Color.Carebase.background)
        .cornerRadius(8)
    }
}

// MARK: - Sponsor Visit Note Card

struct SponsorVisitNoteCard: View {
    let visitNote: VisitNote

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            HStack {
                // Template name or type
                Text(visitNote.template?.name ?? "Care Note")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(Color.Carebase.textPrimary)

                Spacer()

                // Date
                Text(visitNote.createdAtFormatted)
                    .font(.caption)
                    .foregroundColor(Color.Carebase.textTertiary)
            }

            // Client name
            if let client = visitNote.client {
                HStack(spacing: 4) {
                    Image(systemName: "person.fill")
                        .font(.caption2)
                    Text(client.fullName)
                        .font(.caption)
                }
                .foregroundColor(Color.Carebase.textSecondary)
            }

            // Carer who wrote the note
            if let carer = visitNote.carer {
                HStack(spacing: 4) {
                    Image(systemName: "stethoscope")
                        .font(.caption2)
                    Text("By \(carer.fullName)")
                        .font(.caption)
                }
                .foregroundColor(Color.Carebase.textSecondary)
            }
        }
        .padding()
        .background(Color.Carebase.background)
        .cornerRadius(8)
    }
}

#Preview {
    SponsorDashboardView()
        .environmentObject(AuthenticationManager())
}
