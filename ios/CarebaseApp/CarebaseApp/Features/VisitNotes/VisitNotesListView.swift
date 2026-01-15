import SwiftUI

// MARK: - Visit Notes List View
// All submitted visit notes in one place
// Easy to search and review

struct VisitNotesListView: View {
    @StateObject private var viewModel = VisitNotesViewModel()
    @State private var searchText = ""

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading && viewModel.notes.isEmpty {
                    LoadingView()
                } else if filteredNotes.isEmpty {
                    EmptyNotesView(hasSearch: !searchText.isEmpty)
                } else {
                    NotesList(notes: filteredNotes)
                }
            }
            .background(Color.Carebase.backgroundSecondary)
            .navigationTitle("Visit Notes")
            .navigationBarTitleDisplayMode(.large)
            .searchable(text: $searchText, prompt: "Search notes...")
            .refreshable {
                await viewModel.refresh()
            }
        }
        .task {
            await viewModel.loadNotes()
        }
    }

    private var filteredNotes: [VisitNote] {
        if searchText.isEmpty {
            return viewModel.notes
        }
        return viewModel.notes.filter { note in
            note.templateName.localizedCaseInsensitiveContains(searchText) ||
            note.client?.fullName.localizedCaseInsensitiveContains(searchText) == true
        }
    }
}

// MARK: - Notes List
struct NotesList: View {
    let notes: [VisitNote]

    var body: some View {
        ScrollView {
            LazyVStack(spacing: Spacing.sm) {
                ForEach(groupedNotes, id: \.date) { group in
                    Section {
                        ForEach(group.notes) { note in
                            NavigationLink(destination: VisitNoteDetailView(noteId: note.id)) {
                                VisitNoteRow(note: note)
                            }
                            .buttonStyle(.plain)
                        }
                    } header: {
                        HStack {
                            Text(group.dateLabel)
                                .font(.Carebase.labelMedium)
                                .foregroundColor(Color.Carebase.textSecondary)
                            Spacer()
                        }
                        .padding(.top, Spacing.md)
                    }
                }
            }
            .padding(.horizontal, Spacing.screenHorizontal)
            .padding(.vertical, Spacing.md)
        }
    }

    private var groupedNotes: [NotesGroup] {
        let calendar = Calendar.current
        let grouped = Dictionary(grouping: notes) { note in
            calendar.startOfDay(for: note.submittedAt)
        }

        return grouped.map { date, notes in
            NotesGroup(date: date, notes: notes.sorted { $0.submittedAt > $1.submittedAt })
        }.sorted { $0.date > $1.date }
    }
}

struct NotesGroup {
    let date: Date
    let notes: [VisitNote]

    var dateLabel: String {
        let calendar = Calendar.current
        if calendar.isDateInToday(date) {
            return "Today"
        } else if calendar.isDateInYesterday(date) {
            return "Yesterday"
        } else {
            let formatter = DateFormatter()
            formatter.dateFormat = "EEEE, MMM d"
            return formatter.string(from: date)
        }
    }
}

// MARK: - Visit Note Row
struct VisitNoteRow: View {
    let note: VisitNote

    var body: some View {
        CarebaseCard {
            HStack(spacing: Spacing.md) {
                // Icon
                Image(systemName: "doc.text.fill")
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(Color.Carebase.accent)
                    .frame(width: 44, height: 44)
                    .background(Color.Carebase.accentSoft)
                    .clipShape(Circle())

                // Info
                VStack(alignment: .leading, spacing: Spacing.xxs) {
                    Text(note.templateName)
                        .font(.Carebase.bodyLarge)
                        .foregroundColor(Color.Carebase.textPrimary)

                    if let client = note.client {
                        Text(client.fullName)
                            .font(.Carebase.bodySmall)
                            .foregroundColor(Color.Carebase.textSecondary)
                    }
                }

                Spacer()

                // Time
                VStack(alignment: .trailing, spacing: Spacing.xxs) {
                    Text(formatTime(note.submittedAt))
                        .font(.Carebase.labelMedium)
                        .foregroundColor(Color.Carebase.textSecondary)

                    Image(systemName: "chevron.right")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(Color.Carebase.textTertiary)
                }
            }
        }
    }

    private func formatTime(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"
        return formatter.string(from: date)
    }
}

// MARK: - Empty Notes View
struct EmptyNotesView: View {
    let hasSearch: Bool

    var body: some View {
        VStack(spacing: Spacing.lg) {
            Spacer()

            Image(systemName: hasSearch ? "magnifyingglass" : "doc.text")
                .font(.system(size: 64, weight: .light))
                .foregroundColor(Color.Carebase.textTertiary)

            VStack(spacing: Spacing.xs) {
                Text(hasSearch ? "No results" : "No visit notes")
                    .font(.Carebase.headlineMedium)
                    .foregroundColor(Color.Carebase.textPrimary)

                Text(hasSearch ? "Try a different search term" : "You haven't submitted any visit notes yet.")
                    .font(.Carebase.bodyMedium)
                    .foregroundColor(Color.Carebase.textSecondary)
                    .multilineTextAlignment(.center)
            }

            Spacer()
        }
        .padding()
    }
}

// MARK: - View Model
@MainActor
class VisitNotesViewModel: ObservableObject {
    @Published var notes: [VisitNote] = []
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIClient.shared

    func loadNotes() async {
        isLoading = true
        error = nil

        do {
            let response: VisitNotesResponse = try await api.request(endpoint: .visitNotes)
            self.notes = response.visitNotes
        } catch let apiError as APIError {
            self.error = apiError.errorDescription
        } catch {
            self.error = "Failed to load visit notes"
        }

        isLoading = false
    }

    func refresh() async {
        await loadNotes()
    }
}

#Preview {
    VisitNotesListView()
}
