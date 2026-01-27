import SwiftUI

// MARK: - Sponsor Visit Notes View
// Shows all visit notes for the sponsor's associated clients

struct SponsorVisitNotesView: View {
    @State private var visitNotes: [VisitNote] = []
    @State private var isLoading = true
    @State private var error: String?
    @State private var selectedNote: VisitNote?

    var body: some View {
        NavigationStack {
            Group {
                if isLoading {
                    loadingView
                } else if let error = error {
                    errorView(error)
                } else if visitNotes.isEmpty {
                    emptyView
                } else {
                    notesList
                }
            }
            .navigationTitle("Visit Notes")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        Task { await fetchVisitNotes() }
                    } label: {
                        Image(systemName: "arrow.clockwise")
                    }
                }
            }
            .sheet(item: $selectedNote) { note in
                SponsorVisitNoteDetailView(visitNote: note)
            }
        }
        .task {
            await fetchVisitNotes()
        }
    }

    // MARK: - Loading View

    private var loadingView: some View {
        VStack(spacing: Spacing.md) {
            ProgressView()
            Text("Loading visit notes...")
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
                Task { await fetchVisitNotes() }
            }
            .buttonStyle(.bordered)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    // MARK: - Empty View

    private var emptyView: some View {
        VStack(spacing: Spacing.md) {
            Image(systemName: "doc.text")
                .font(.system(size: 60))
                .foregroundColor(Color.Carebase.textTertiary)
            Text("No Visit Notes")
                .font(.headline)
            Text("Care notes from visits will appear here once carers complete their visits.")
                .font(.subheadline)
                .foregroundColor(Color.Carebase.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    // MARK: - Notes List

    private var notesList: some View {
        List {
            ForEach(groupedNotes, id: \.key) { group in
                Section(header: Text(group.key)) {
                    ForEach(group.value) { note in
                        SponsorVisitNoteRow(visitNote: note)
                            .contentShape(Rectangle())
                            .onTapGesture {
                                selectedNote = note
                            }
                    }
                }
            }
        }
        .listStyle(.insetGrouped)
        .refreshable {
            await fetchVisitNotes(isRefresh: true)
        }
    }

    // Group notes by date
    private var groupedNotes: [(key: String, value: [VisitNote])] {
        let grouped = Dictionary(grouping: visitNotes) { note in
            note.dateGroupKey
        }
        return grouped.sorted { $0.key > $1.key }
    }

    // MARK: - Data Fetching

    private func fetchVisitNotes(isRefresh: Bool = false) async {
        if !isRefresh {
            isLoading = true
        }
        error = nil

        do {
            let response: VisitNotesResponse = try await APIClient.shared.request(
                endpoint: .visitNotes,
                method: .get
            )

            await MainActor.run {
                visitNotes = response.visitNotes
                isLoading = false
            }
        } catch let apiError as APIError {
            await MainActor.run {
                if visitNotes.isEmpty {
                    error = apiError.errorDescription ?? "Failed to load visit notes"
                }
                isLoading = false
            }
        } catch {
            await MainActor.run {
                if visitNotes.isEmpty {
                    self.error = "Failed to load visit notes"
                }
                isLoading = false
            }
        }
    }
}

// MARK: - Visit Note Extensions

extension VisitNote {
    var dateGroupKey: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMMM yyyy"
        return formatter.string(from: createdAt)
    }
}

// MARK: - Sponsor Visit Note Row

struct SponsorVisitNoteRow: View {
    let visitNote: VisitNote

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            HStack {
                // Template/Type
                Text(visitNote.template?.name ?? "Care Note")
                    .font(.headline)
                    .foregroundColor(Color.Carebase.textPrimary)

                Spacer()

                // Date
                Text(visitNote.createdAtFormatted)
                    .font(.caption)
                    .foregroundColor(Color.Carebase.textTertiary)
            }

            // Client
            if let client = visitNote.client {
                HStack(spacing: 4) {
                    Image(systemName: "person.fill")
                        .font(.caption2)
                    Text(client.fullName)
                        .font(.subheadline)
                }
                .foregroundColor(Color.Carebase.textSecondary)
            }

            // Carer
            if let carer = visitNote.carer {
                HStack(spacing: 4) {
                    Image(systemName: "stethoscope")
                        .font(.caption2)
                    Text("Care by \(carer.fullName)")
                        .font(.caption)
                }
                .foregroundColor(Color.Carebase.textTertiary)
            }

            // Status badge
            HStack {
                Spacer()
                StatusBadge(
                    visitNote.status.replacingOccurrences(of: "_", with: " ").capitalized,
                    color: visitNote.status == "COMPLETED" ? Color.Carebase.success : Color.Carebase.info,
                    size: .small
                )
            }
        }
        .padding(.vertical, Spacing.xs)
    }
}

// MARK: - Sponsor Visit Note Detail View

struct SponsorVisitNoteDetailView: View {
    let visitNote: VisitNote
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: Spacing.lg) {
                    // Header
                    headerSection

                    // Visit Info
                    visitInfoSection

                    // Note Content
                    if let responses = visitNote.responses, !responses.isEmpty {
                        noteContentSection(responses)
                    }
                }
                .padding()
            }
            .background(Color.Carebase.background)
            .navigationTitle("Visit Note")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }

    // MARK: - Header Section

    private var headerSection: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            Text(visitNote.template?.name ?? "Care Note")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(Color.Carebase.textPrimary)

            Text(visitNote.createdAtFormatted)
                .font(.subheadline)
                .foregroundColor(Color.Carebase.textSecondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color.Carebase.surface)
        .cornerRadius(12)
    }

    // MARK: - Visit Info Section

    private var visitInfoSection: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            Text("Visit Information")
                .font(.headline)
                .foregroundColor(Color.Carebase.textPrimary)

            VStack(spacing: Spacing.sm) {
                // Client
                if let client = visitNote.client {
                    infoRow(icon: "person.fill", label: "Client", value: client.fullName)
                }

                // Carer
                if let carer = visitNote.carer {
                    infoRow(icon: "stethoscope", label: "Carer", value: carer.fullName)
                }

                // Shift time
                if let shift = visitNote.shift {
                    infoRow(icon: "clock.fill", label: "Visit Time", value: shift.timeRangeFormatted)
                }

                // Status
                infoRow(
                    icon: "checkmark.circle.fill",
                    label: "Status",
                    value: visitNote.status.replacingOccurrences(of: "_", with: " ").capitalized
                )
            }
        }
        .padding()
        .background(Color.Carebase.surface)
        .cornerRadius(12)
    }

    private func infoRow(icon: String, label: String, value: String) -> some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(Color.Carebase.accent)
                .frame(width: 24)

            Text(label)
                .font(.subheadline)
                .foregroundColor(Color.Carebase.textSecondary)

            Spacer()

            Text(value)
                .font(.subheadline)
                .foregroundColor(Color.Carebase.textPrimary)
        }
        .padding(.vertical, Spacing.xs)
    }

    // MARK: - Note Content Section

    private func noteContentSection(_ responses: [String: AnyCodable]) -> some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            Text("Care Notes")
                .font(.headline)
                .foregroundColor(Color.Carebase.textPrimary)

            ForEach(Array(responses.keys.sorted()), id: \.self) { key in
                if let value = responses[key] {
                    VStack(alignment: .leading, spacing: Spacing.xs) {
                        Text(formatFieldLabel(key))
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(Color.Carebase.textSecondary)

                        Text(formatFieldValue(value))
                            .font(.body)
                            .foregroundColor(Color.Carebase.textPrimary)
                    }
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.Carebase.background)
                    .cornerRadius(8)
                }
            }
        }
        .padding()
        .background(Color.Carebase.surface)
        .cornerRadius(12)
    }

    private func formatFieldLabel(_ key: String) -> String {
        key.replacingOccurrences(of: "_", with: " ")
            .replacingOccurrences(of: "-", with: " ")
            .capitalized
    }

    private func formatFieldValue(_ value: AnyCodable) -> String {
        if let stringValue = value.value as? String {
            return stringValue
        } else if let boolValue = value.value as? Bool {
            return boolValue ? "Yes" : "No"
        } else if let intValue = value.value as? Int {
            return String(intValue)
        } else if let doubleValue = value.value as? Double {
            return String(format: "%.1f", doubleValue)
        } else if let arrayValue = value.value as? [Any] {
            return arrayValue.map { String(describing: $0) }.joined(separator: ", ")
        } else {
            return String(describing: value.value)
        }
    }
}

#Preview {
    SponsorVisitNotesView()
}
