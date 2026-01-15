import SwiftUI

// MARK: - Shift Detail View
// Everything about a shift in one place
// Clear actions, easy navigation

struct ShiftDetailView: View {
    let shiftId: String
    @StateObject private var viewModel = ShiftDetailViewModel()
    @StateObject private var templateViewModel = TemplateSelectionViewModel()
    @StateObject private var visitNotesViewModel = ShiftVisitNotesViewModel()
    @State private var showCheckInConfirmation = false
    @State private var showCheckOutConfirmation = false
    @State private var showTemplateSelector = false
    @State private var showNoTemplatesAlert = false
    @State private var selectedTemplateForNote: FormTemplate?
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ScrollView {
            VStack(spacing: Spacing.xl) {
                if let shift = viewModel.shift {
                    // Status Header
                    ShiftStatusHeader(shift: shift)

                    // Client Info
                    ClientInfoSection(client: shift.client)

                    // Time & Location
                    TimeLocationSection(shift: shift)

                    // Notes
                    if let notes = shift.notes, !notes.isEmpty {
                        NotesSection(notes: notes)
                    }

                    // Visit Notes
                    ShiftVisitNotesSection(
                        visitNotes: visitNotesViewModel.visitNotes,
                        isLoading: visitNotesViewModel.isLoading
                    )

                    // Actions
                    ShiftActionsSection(
                        shift: shift,
                        onCheckIn: { showCheckInConfirmation = true },
                        onCheckOut: { showCheckOutConfirmation = true },
                        onAddNote: { handleAddNote() }
                    )
                } else if viewModel.isLoading {
                    LoadingView()
                } else if let error = viewModel.error {
                    ErrorStateView(message: error) {
                        Task { await viewModel.loadShift(id: shiftId) }
                    }
                }
            }
            .padding(.vertical, Spacing.lg)
        }
        .background(Color.Carebase.backgroundSecondary)
        .navigationTitle("Shift Details")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await viewModel.loadShift(id: shiftId)
        }
        .task {
            await templateViewModel.loadTemplates()
        }
        .task {
            await visitNotesViewModel.loadVisitNotes(forShiftId: shiftId)
        }
        .confirmationDialog(
            "Check In",
            isPresented: $showCheckInConfirmation,
            titleVisibility: .visible
        ) {
            Button("Confirm Check In") {
                Task { await viewModel.checkIn() }
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("Are you ready to start this shift?")
        }
        .confirmationDialog(
            "Check Out",
            isPresented: $showCheckOutConfirmation,
            titleVisibility: .visible
        ) {
            Button("Confirm Check Out") {
                Task { await viewModel.checkOut() }
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("Are you sure you want to end this shift?")
        }
        .alert("No Forms Available", isPresented: $showNoTemplatesAlert) {
            Button("OK", role: .cancel) {}
        } message: {
            Text("Your administrator hasn't set up any visit note forms yet. Please contact them to create and enable forms.")
        }
        .sheet(isPresented: $showTemplateSelector) {
            TemplateSelectionSheet(
                templates: templateViewModel.templates,
                isLoading: templateViewModel.isLoading,
                error: templateViewModel.error,
                onSelect: { template in
                    showTemplateSelector = false
                    // Delay navigation to allow sheet to dismiss first
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                        selectedTemplateForNote = template
                    }
                },
                onRetry: {
                    Task { await templateViewModel.loadTemplates() }
                },
                onCancel: {
                    showTemplateSelector = false
                }
            )
            .presentationDetents([.medium, .large])
            .presentationDragIndicator(.visible)
        }
        .navigationDestination(isPresented: Binding(
            get: { selectedTemplateForNote != nil },
            set: { if !$0 { selectedTemplateForNote = nil } }
        )) {
            if let shift = viewModel.shift, let template = selectedTemplateForNote {
                NewVisitNoteView(shiftId: shift.id, clientId: shift.clientId, template: template)
            }
        }
        .onChange(of: selectedTemplateForNote) { oldValue, newValue in
            // Refresh visit notes when returning from adding a new note
            if oldValue != nil && newValue == nil {
                Task {
                    await visitNotesViewModel.loadVisitNotes(forShiftId: shiftId)
                }
            }
        }
    }

    private func handleAddNote() {
        // If still loading, show the selector which will display loading state
        if templateViewModel.isLoading {
            showTemplateSelector = true
            return
        }

        let templates = templateViewModel.templates

        #if DEBUG
        print("ShiftDetail handleAddNote: \(templates.count) templates available")
        #endif

        if templates.isEmpty && templateViewModel.error != nil {
            // Error loading templates, show selector to display error and retry
            showTemplateSelector = true
        } else if templates.isEmpty {
            showNoTemplatesAlert = true
        } else if templates.count == 1 {
            // Only one template, go directly to the form
            selectedTemplateForNote = templates.first
        } else {
            // Multiple templates, show selector
            showTemplateSelector = true
        }
    }
}

// MARK: - Status Header
struct ShiftStatusHeader: View {
    let shift: Shift

    var body: some View {
        CarebaseCard(backgroundColor: statusColor.opacity(0.1)) {
            HStack(spacing: Spacing.md) {
                Image(systemName: statusIcon)
                    .font(.system(size: 24, weight: .semibold))
                    .foregroundColor(statusColor)
                    .frame(width: 48, height: 48)
                    .background(statusColor.opacity(0.15))
                    .clipShape(Circle())

                VStack(alignment: .leading, spacing: Spacing.xxs) {
                    Text(shift.status.displayName)
                        .font(.Carebase.headlineSmall)
                        .foregroundColor(statusColor)

                    Text(statusMessage)
                        .font(.Carebase.bodySmall)
                        .foregroundColor(Color.Carebase.textSecondary)
                }

                Spacer()

                StatusBadge.shiftStatus(shift.status.badgeStatus)
            }
        }
        .screenPadding()
    }

    private var statusColor: Color {
        switch shift.status {
        case .scheduled: return Color.Carebase.accent
        case .inProgress: return Color.Carebase.success
        case .completed: return Color.Carebase.textTertiary
        case .cancelled, .noShow: return Color.Carebase.error
        }
    }

    private var statusIcon: String {
        switch shift.status {
        case .scheduled: return "calendar.badge.clock"
        case .inProgress: return "clock.fill"
        case .completed: return "checkmark.circle.fill"
        case .cancelled, .noShow: return "xmark.circle.fill"
        }
    }

    private var statusMessage: String {
        switch shift.status {
        case .scheduled: return "Scheduled for \(shift.timeRangeFormatted)"
        case .inProgress: return "Started at \(formatTime(shift.actualStart))"
        case .completed: return "Completed at \(formatTime(shift.actualEnd))"
        case .cancelled: return "This shift was cancelled"
        case .noShow: return "Marked as no-show"
        }
    }

    private func formatTime(_ date: Date?) -> String {
        guard let date = date else { return "" }
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"
        return formatter.string(from: date)
    }
}

// MARK: - Client Info Section
struct ClientInfoSection: View {
    let client: ShiftClient?

    var body: some View {
        guard let client = client else { return AnyView(EmptyView()) }

        return AnyView(
            VStack(alignment: .leading, spacing: Spacing.md) {
                Text("Client")
                    .font(.Carebase.labelMedium)
                    .foregroundColor(Color.Carebase.textSecondary)
                    .screenPadding()

                NavigationLink(destination: ClientDetailView(clientId: client.id)) {
                    CarebaseCard {
                        HStack(spacing: Spacing.md) {
                            Avatar(name: client.fullName, size: 56)

                            VStack(alignment: .leading, spacing: Spacing.xxs) {
                                Text(client.fullName)
                                    .font(.Carebase.headlineSmall)
                                    .foregroundColor(Color.Carebase.textPrimary)

                                if let address = client.address {
                                    Text(address)
                                        .font(.Carebase.bodySmall)
                                        .foregroundColor(Color.Carebase.textSecondary)
                                        .lineLimit(1)
                                }
                            }

                            Spacer()

                            Image(systemName: "chevron.right")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(Color.Carebase.textTertiary)
                        }
                    }
                }
                .buttonStyle(.plain)
                .screenPadding()
            }
        )
    }
}

// MARK: - Time & Location Section
struct TimeLocationSection: View {
    let shift: Shift

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            Text("Schedule")
                .font(.Carebase.labelMedium)
                .foregroundColor(Color.Carebase.textSecondary)
                .screenPadding()

            CarebaseCard {
                VStack(spacing: Spacing.md) {
                    // Date & Time
                    HStack(spacing: Spacing.md) {
                        Image(systemName: "calendar")
                            .font(.system(size: 20, weight: .medium))
                            .foregroundColor(Color.Carebase.accent)
                            .frame(width: 40, height: 40)
                            .background(Color.Carebase.accentSoft)
                            .clipShape(Circle())

                        VStack(alignment: .leading, spacing: Spacing.xxs) {
                            Text(formatDate(shift.scheduledStart))
                                .font(.Carebase.bodyLarge)
                                .foregroundColor(Color.Carebase.textPrimary)

                            Text("\(shift.timeRangeFormatted) (\(shift.durationFormatted))")
                                .font(.Carebase.bodySmall)
                                .foregroundColor(Color.Carebase.textSecondary)
                        }

                        Spacer()
                    }

                    // Location (from client address)
                    if let clientAddress = shift.client?.address {
                        Divider()

                        HStack(spacing: Spacing.md) {
                            Image(systemName: "mappin.circle.fill")
                                .font(.system(size: 20, weight: .medium))
                                .foregroundColor(Color.Carebase.info)
                                .frame(width: 40, height: 40)
                                .background(Color.Carebase.infoSoft)
                                .clipShape(Circle())

                            Text(clientAddress)
                                .font(.Carebase.bodyMedium)
                                .foregroundColor(Color.Carebase.textPrimary)
                                .frame(maxWidth: .infinity, alignment: .leading)

                            Button(action: { openInMaps(clientAddress) }) {
                                Image(systemName: "arrow.triangle.turn.up.right.circle.fill")
                                    .font(.system(size: 32))
                                    .foregroundColor(Color.Carebase.accent)
                            }
                        }
                    }
                }
            }
            .screenPadding()
        }
    }

    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE, MMMM d, yyyy"
        return formatter.string(from: date)
    }

    private func openInMaps(_ address: String) {
        if let encoded = address.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
           let url = URL(string: "maps://?address=\(encoded)") {
            UIApplication.shared.open(url)
        }
    }
}

// MARK: - Notes Section
struct NotesSection: View {
    let notes: String

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            Text("Notes")
                .font(.Carebase.labelMedium)
                .foregroundColor(Color.Carebase.textSecondary)
                .screenPadding()

            CarebaseCard {
                Text(notes)
                    .font(.Carebase.bodyMedium)
                    .foregroundColor(Color.Carebase.textPrimary)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .screenPadding()
        }
    }
}

// MARK: - Actions Section
struct ShiftActionsSection: View {
    let shift: Shift
    let onCheckIn: () -> Void
    let onCheckOut: () -> Void
    var onAddNote: (() -> Void)? = nil

    var body: some View {
        VStack(spacing: Spacing.md) {
            switch shift.status {
            case .scheduled:
                CarebaseButton(
                    "Check In",
                    icon: "checkmark.circle.fill",
                    style: .primary,
                    size: .large,
                    isFullWidth: true,
                    action: onCheckIn
                )

            case .inProgress:
                CarebaseButton(
                    "Check Out",
                    icon: "arrow.right.square.fill",
                    style: .primary,
                    size: .large,
                    isFullWidth: true,
                    action: onCheckOut
                )

                Button(action: {
                    HapticType.light.trigger()
                    onAddNote?()
                }) {
                    HStack {
                        Image(systemName: "doc.text.fill")
                        Text("Add Visit Note")
                    }
                    .font(.Carebase.labelLarge)
                    .foregroundColor(Color.Carebase.accent)
                    .frame(maxWidth: .infinity)
                    .frame(height: 48)
                    .background(Color.Carebase.accentSoft)
                    .cornerRadius(CornerRadius.lg)
                }

            case .completed:
                NavigationLink(destination: VisitNotesListView()) {
                    HStack {
                        Image(systemName: "doc.text.fill")
                        Text("View Visit Notes")
                    }
                    .font(.Carebase.labelLarge)
                    .foregroundColor(Color.Carebase.accent)
                    .frame(maxWidth: .infinity)
                    .frame(height: 48)
                    .background(Color.Carebase.accentSoft)
                    .cornerRadius(CornerRadius.lg)
                }

            default:
                EmptyView()
            }

            // Directions button
            if let address = shift.client?.address {
                CarebaseButton("Get Directions", icon: "arrow.triangle.turn.up.right.circle.fill", style: .tertiary) {
                    if let encoded = address.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
                       let url = URL(string: "maps://?address=\(encoded)") {
                        UIApplication.shared.open(url)
                    }
                }
            }
        }
        .screenPadding()
        .padding(.bottom, Spacing.xl)
    }
}

// MARK: - Visit Notes Section
struct ShiftVisitNotesSection: View {
    let visitNotes: [VisitNote]
    let isLoading: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            HStack {
                Text("Visit Notes")
                    .font(.Carebase.labelMedium)
                    .foregroundColor(Color.Carebase.textSecondary)

                Spacer()

                if !visitNotes.isEmpty {
                    Text("\(visitNotes.count)")
                        .font(.Carebase.labelSmall)
                        .foregroundColor(Color.Carebase.accent)
                        .padding(.horizontal, Spacing.sm)
                        .padding(.vertical, Spacing.xxs)
                        .background(Color.Carebase.accentSoft)
                        .cornerRadius(CornerRadius.sm)
                }
            }
            .screenPadding()

            if isLoading {
                CarebaseCard {
                    HStack {
                        ProgressView()
                            .scaleEffect(0.8)
                        Text("Loading notes...")
                            .font(.Carebase.bodySmall)
                            .foregroundColor(Color.Carebase.textSecondary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, Spacing.md)
                }
                .screenPadding()
            } else if visitNotes.isEmpty {
                CarebaseCard {
                    VStack(spacing: Spacing.sm) {
                        Image(systemName: "doc.text")
                            .font(.system(size: 32, weight: .light))
                            .foregroundColor(Color.Carebase.textTertiary)

                        Text("No visit notes yet")
                            .font(.Carebase.bodyMedium)
                            .foregroundColor(Color.Carebase.textSecondary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, Spacing.lg)
                }
                .screenPadding()
            } else {
                VStack(spacing: Spacing.sm) {
                    ForEach(visitNotes) { note in
                        NavigationLink(destination: VisitNoteDetailView(noteId: note.id)) {
                            VisitNoteCard(note: note)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .screenPadding()
            }
        }
    }
}

// MARK: - Visit Note Card
struct VisitNoteCard: View {
    let note: VisitNote

    var body: some View {
        CarebaseCard {
            HStack(spacing: Spacing.md) {
                Image(systemName: "doc.text.fill")
                    .font(.system(size: 20, weight: .medium))
                    .foregroundColor(Color.Carebase.accent)
                    .frame(width: 44, height: 44)
                    .background(Color.Carebase.accentSoft)
                    .clipShape(Circle())

                VStack(alignment: .leading, spacing: Spacing.xxs) {
                    Text(note.templateName)
                        .font(.Carebase.headlineSmall)
                        .foregroundColor(Color.Carebase.textPrimary)

                    Text(note.submittedAtFormatted)
                        .font(.Carebase.bodySmall)
                        .foregroundColor(Color.Carebase.textSecondary)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(Color.Carebase.textTertiary)
            }
        }
    }
}

// MARK: - View Model
@MainActor
class ShiftDetailViewModel: ObservableObject {
    @Published var shift: Shift?
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIClient.shared

    func loadShift(id: String) async {
        isLoading = true
        error = nil

        do {
            let response: ShiftResponse = try await api.request(endpoint: .shift(id: id))
            self.shift = response.shift
        } catch let apiError as APIError {
            self.error = apiError.errorDescription
        } catch {
            self.error = "Failed to load shift"
        }

        isLoading = false
    }

    func checkIn() async {
        guard let shift = shift else { return }
        isLoading = true
        error = nil

        do {
            let response: CheckInResponse = try await api.request(
                endpoint: .checkIn(shiftId: shift.id),
                method: .post
            )
            self.shift = response.shift
            HapticType.success.trigger()
        } catch let apiError as APIError {
            self.error = apiError.errorDescription
            HapticType.error.trigger()
        } catch {
            self.error = "Failed to check in"
            HapticType.error.trigger()
        }

        isLoading = false
    }

    func checkOut() async {
        guard let shift = shift else { return }
        isLoading = true
        error = nil

        do {
            let response: CheckOutResponse = try await api.request(
                endpoint: .checkOut(shiftId: shift.id),
                method: .post
            )
            self.shift = response.shift
            HapticType.success.trigger()
        } catch let apiError as APIError {
            self.error = apiError.errorDescription
            HapticType.error.trigger()
        } catch {
            self.error = "Failed to check out"
            HapticType.error.trigger()
        }

        isLoading = false
    }
}

// MARK: - Shift Visit Notes View Model
@MainActor
class ShiftVisitNotesViewModel: ObservableObject {
    @Published var visitNotes: [VisitNote] = []
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIClient.shared

    func loadVisitNotes(forShiftId shiftId: String) async {
        isLoading = true
        error = nil

        do {
            let response: VisitNotesResponse = try await api.request(
                endpoint: .visitNotes,
                queryParams: ["shiftId": shiftId]
            )
            self.visitNotes = response.visitNotes
        } catch let apiError as APIError {
            self.error = apiError.errorDescription
            #if DEBUG
            print("Error loading visit notes: \(apiError)")
            #endif
        } catch {
            self.error = "Failed to load visit notes"
            #if DEBUG
            print("Error loading visit notes: \(error)")
            #endif
        }

        isLoading = false
    }
}

#Preview {
    NavigationStack {
        ShiftDetailView(shiftId: "1")
    }
}
