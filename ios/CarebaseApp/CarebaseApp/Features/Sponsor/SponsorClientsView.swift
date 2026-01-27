import SwiftUI

// MARK: - Sponsor Clients View
// Shows list of clients associated with the sponsor

struct SponsorClientsView: View {
    @State private var clients: [Client] = []
    @State private var isLoading = true
    @State private var error: String?
    @State private var selectedClient: Client?

    var body: some View {
        NavigationStack {
            Group {
                if isLoading {
                    loadingView
                } else if let error = error {
                    errorView(error)
                } else if clients.isEmpty {
                    emptyView
                } else {
                    clientsList
                }
            }
            .navigationTitle("My Clients")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        Task { await fetchClients() }
                    } label: {
                        Image(systemName: "arrow.clockwise")
                    }
                }
            }
            .sheet(item: $selectedClient) { client in
                SponsorClientDetailView(client: client)
            }
        }
        .task {
            await fetchClients()
        }
    }

    // MARK: - Loading View

    private var loadingView: some View {
        VStack(spacing: Spacing.md) {
            ProgressView()
            Text("Loading clients...")
                .font(.subheadline)
                .foregroundColor(Color.Carebase.textSecondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
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
                Task { await fetchClients() }
            }
            .buttonStyle(.bordered)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    // MARK: - Empty View

    private var emptyView: some View {
        VStack(spacing: Spacing.md) {
            Image(systemName: "person.crop.circle.badge.questionmark")
                .font(.system(size: 60))
                .foregroundColor(Color.Carebase.textTertiary)
            Text("No Clients")
                .font(.headline)
            Text("You don't have any clients associated with your account yet.")
                .font(.subheadline)
                .foregroundColor(Color.Carebase.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    // MARK: - Clients List

    private var clientsList: some View {
        List {
            ForEach(clients) { client in
                SponsorClientRow(client: client)
                    .contentShape(Rectangle())
                    .onTapGesture {
                        selectedClient = client
                    }
            }
        }
        .listStyle(.plain)
        .refreshable {
            await fetchClients(isRefresh: true)
        }
    }

    // MARK: - Data Fetching

    private func fetchClients(isRefresh: Bool = false) async {
        if !isRefresh {
            isLoading = true
        }
        error = nil

        do {
            let response: ClientsResponse = try await APIClient.shared.request(
                endpoint: .clients,
                method: .get
            )

            await MainActor.run {
                clients = response.clients
                isLoading = false
            }
        } catch let apiError as APIError {
            await MainActor.run {
                if clients.isEmpty {
                    error = apiError.errorDescription ?? "Failed to load clients"
                }
                isLoading = false
            }
        } catch {
            await MainActor.run {
                if clients.isEmpty {
                    self.error = "Failed to load clients"
                }
                isLoading = false
            }
        }
    }
}

// MARK: - Sponsor Client Row

struct SponsorClientRow: View {
    let client: Client

    var body: some View {
        HStack(spacing: Spacing.md) {
            // Avatar
            Circle()
                .fill(Color.Carebase.accent.opacity(0.2))
                .frame(width: 56, height: 56)
                .overlay(
                    Text(client.initials)
                        .font(.title3)
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

                if let phone = client.phone, !phone.isEmpty {
                    HStack(spacing: 4) {
                        Image(systemName: "phone.fill")
                            .font(.caption2)
                        Text(phone)
                            .font(.caption)
                    }
                    .foregroundColor(Color.Carebase.textSecondary)
                }
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundColor(Color.Carebase.textTertiary)
        }
        .padding(.vertical, Spacing.sm)
    }
}

// MARK: - Sponsor Client Detail View

struct SponsorClientDetailView: View {
    let client: Client
    @Environment(\.dismiss) private var dismiss
    @State private var visitNotes: [VisitNote] = []
    @State private var upcomingShifts: [Shift] = []
    @State private var isLoading = true

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: Spacing.lg) {
                    // Client Header
                    clientHeader

                    // Contact Info
                    if client.phone != nil || client.address != nil {
                        contactSection
                    }

                    // Recent Visit Notes
                    visitNotesSection

                    // Upcoming Visits
                    upcomingVisitsSection
                }
                .padding()
            }
            .background(Color.Carebase.background)
            .navigationTitle(client.fullName)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
        .task {
            await fetchClientDetails()
        }
    }

    // MARK: - Client Header

    private var clientHeader: some View {
        VStack(spacing: Spacing.md) {
            Circle()
                .fill(Color.Carebase.accent.opacity(0.2))
                .frame(width: 80, height: 80)
                .overlay(
                    Text(client.initials)
                        .font(.title)
                        .fontWeight(.bold)
                        .foregroundColor(Color.Carebase.accent)
                )

            Text(client.fullName)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(Color.Carebase.textPrimary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.Carebase.surface)
        .cornerRadius(12)
    }

    // MARK: - Contact Section

    private var contactSection: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            Text("Contact Information")
                .font(.headline)
                .foregroundColor(Color.Carebase.textPrimary)

            VStack(spacing: Spacing.sm) {
                if let phone = client.phone, !phone.isEmpty {
                    HStack {
                        Image(systemName: "phone.fill")
                            .foregroundColor(Color.Carebase.accent)
                            .frame(width: 24)
                        Text(phone)
                            .foregroundColor(Color.Carebase.textPrimary)
                        Spacer()
                        Button {
                            if let url = URL(string: "tel:\(phone)") {
                                UIApplication.shared.open(url)
                            }
                        } label: {
                            Image(systemName: "phone.arrow.up.right")
                                .foregroundColor(Color.Carebase.accent)
                        }
                    }
                    .padding()
                    .background(Color.Carebase.background)
                    .cornerRadius(8)
                }

                if let address = client.address, !address.isEmpty {
                    HStack {
                        Image(systemName: "location.fill")
                            .foregroundColor(Color.Carebase.accent)
                            .frame(width: 24)
                        Text(address)
                            .foregroundColor(Color.Carebase.textPrimary)
                        Spacer()
                    }
                    .padding()
                    .background(Color.Carebase.background)
                    .cornerRadius(8)
                }
            }
        }
        .padding()
        .background(Color.Carebase.surface)
        .cornerRadius(12)
    }

    // MARK: - Visit Notes Section

    private var visitNotesSection: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            HStack {
                Text("Recent Care Notes")
                    .font(.headline)
                    .foregroundColor(Color.Carebase.textPrimary)
                Spacer()
                if !visitNotes.isEmpty {
                    Text("\(visitNotes.count)")
                        .font(.subheadline)
                        .foregroundColor(Color.Carebase.textSecondary)
                }
            }

            if isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity)
                    .padding()
            } else if visitNotes.isEmpty {
                VStack(spacing: Spacing.sm) {
                    Image(systemName: "doc.text")
                        .font(.system(size: 32))
                        .foregroundColor(Color.Carebase.textTertiary)
                    Text("No care notes yet")
                        .font(.subheadline)
                        .foregroundColor(Color.Carebase.textSecondary)
                }
                .frame(maxWidth: .infinity)
                .padding()
            } else {
                ForEach(visitNotes.prefix(5)) { note in
                    SponsorVisitNoteCard(visitNote: note)
                }
            }
        }
        .padding()
        .background(Color.Carebase.surface)
        .cornerRadius(12)
    }

    // MARK: - Upcoming Visits Section

    private var upcomingVisitsSection: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            HStack {
                Text("Upcoming Visits")
                    .font(.headline)
                    .foregroundColor(Color.Carebase.textPrimary)
                Spacer()
                if !upcomingShifts.isEmpty {
                    Text("\(upcomingShifts.count)")
                        .font(.subheadline)
                        .foregroundColor(Color.Carebase.textSecondary)
                }
            }

            if isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity)
                    .padding()
            } else if upcomingShifts.isEmpty {
                VStack(spacing: Spacing.sm) {
                    Image(systemName: "calendar")
                        .font(.system(size: 32))
                        .foregroundColor(Color.Carebase.textTertiary)
                    Text("No upcoming visits scheduled")
                        .font(.subheadline)
                        .foregroundColor(Color.Carebase.textSecondary)
                }
                .frame(maxWidth: .infinity)
                .padding()
            } else {
                ForEach(upcomingShifts.prefix(3)) { shift in
                    UpcomingVisitCard(shift: shift)
                }
            }
        }
        .padding()
        .background(Color.Carebase.surface)
        .cornerRadius(12)
    }

    // MARK: - Data Fetching

    private func fetchClientDetails() async {
        isLoading = true

        do {
            // Fetch visit notes for this client
            let notesResponse: VisitNotesResponse = try await APIClient.shared.request(
                endpoint: .visitNotes,
                method: .get,
                queryParams: ["clientId": client.id]
            )

            // Fetch upcoming shifts for this client
            let shiftsResponse: ShiftsResponse = try await APIClient.shared.request(
                endpoint: .shifts,
                method: .get,
                queryParams: ["clientId": client.id, "status": "SCHEDULED"]
            )

            await MainActor.run {
                visitNotes = notesResponse.visitNotes
                upcomingShifts = shiftsResponse.shifts
                isLoading = false
            }
        } catch {
            await MainActor.run {
                isLoading = false
            }
        }
    }
}

// MARK: - Upcoming Visit Card

struct UpcomingVisitCard: View {
    let shift: Shift

    var body: some View {
        HStack(spacing: Spacing.md) {
            // Date icon
            VStack {
                Text(shift.dayOfMonth)
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(Color.Carebase.accent)
                Text(shift.monthShort)
                    .font(.caption)
                    .foregroundColor(Color.Carebase.textSecondary)
            }
            .frame(width: 50)

            VStack(alignment: .leading, spacing: Spacing.xs) {
                Text(shift.timeRangeFormatted)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(Color.Carebase.textPrimary)

                if let carer = shift.carer {
                    HStack(spacing: 4) {
                        Image(systemName: "person.fill")
                            .font(.caption2)
                        Text(carer.fullName)
                            .font(.caption)
                    }
                    .foregroundColor(Color.Carebase.textSecondary)
                }
            }

            Spacer()
        }
        .padding()
        .background(Color.Carebase.background)
        .cornerRadius(8)
    }
}

// MARK: - Shift Extensions for Display

extension Shift {
    var dayOfMonth: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "d"
        return formatter.string(from: scheduledStart)
    }

    var monthShort: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM"
        return formatter.string(from: scheduledStart)
    }
}

#Preview {
    SponsorClientsView()
}
