import SwiftUI

// MARK: - Dashboard View
// The carer's home - everything they need at a glance
// Prioritizes today's work and immediate actions

struct DashboardView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @EnvironmentObject var appState: AppState
    @StateObject private var viewModel = DashboardViewModel()
    @StateObject private var templateViewModel = TemplateSelectionViewModel()
    @State private var showCheckInConfirmation = false
    @State private var showCheckOutConfirmation = false
    @State private var showNoNoteWarning = false
    @State private var showTemplateSelector = false
    @State private var showNoTemplatesAlert = false
    @State private var selectedTemplateForNote: FormTemplate?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: Spacing.xl) {
                    // Active Shift Card (if in progress)
                    if let activeShift = viewModel.activeShift {
                        ActiveShiftCard(
                            shift: activeShift,
                            onCheckOut: { showCheckOutConfirmation = true }
                        )
                        .transition(.slideUp)
                    }

                    // Today's Overview
                    TodayOverviewSection(viewModel: viewModel)

                    // Next Shift with Check-In
                    if let nextShift = viewModel.nextShift, viewModel.activeShift == nil {
                        NextShiftSection(
                            shift: nextShift,
                            canCheckIn: nextShift.isToday && nextShift.status == .scheduled,
                            onCheckIn: { showCheckInConfirmation = true }
                        )
                    }

                    // Quick Actions
                    QuickActionsSection(
                        canCheckIn: viewModel.nextShift?.isToday == true && viewModel.activeShift == nil,
                        onCheckIn: { showCheckInConfirmation = true }
                    )

                    // Recent Activity
                    if !viewModel.recentNotes.isEmpty {
                        RecentNotesSection(notes: viewModel.recentNotes)
                    }
                }
                .padding(.vertical, Spacing.lg)
            }
            .background(Color.Carebase.backgroundSecondary)
            .navigationTitle(greeting)
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    NotificationButton()
                }
            }
            .refreshable {
                await viewModel.refresh()
            }
        }
        .task {
            await viewModel.loadData()
        }
        .confirmationDialog(
            "Check In",
            isPresented: $showCheckInConfirmation,
            titleVisibility: .visible
        ) {
            Button("Confirm Check In") {
                Task {
                    await viewModel.checkIn()
                }
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            if let shift = viewModel.nextShift {
                Text("Start your shift with \(shift.client?.fullName ?? "client")?")
            }
        }
        .confirmationDialog(
            "Check Out",
            isPresented: $showCheckOutConfirmation,
            titleVisibility: .visible
        ) {
            Button("Confirm Check Out") {
                Task {
                    // Check if a visit note exists for this shift
                    let hasNote = await viewModel.hasVisitNoteForActiveShift()
                    if hasNote {
                        await viewModel.checkOut()
                    } else {
                        showNoNoteWarning = true
                    }
                }
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("Are you sure you want to end this shift?")
        }
        .alert("No Visit Note", isPresented: $showNoNoteWarning) {
            Button("Add Note") {
                handleAddNote()
            }
            Button("Check Out Anyway", role: .destructive) {
                Task {
                    await viewModel.checkOut()
                }
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("You haven't submitted a visit note for this shift. Would you like to add one before checking out?")
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
                    selectedTemplateForNote = template
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
            if let shift = viewModel.activeShift, let template = selectedTemplateForNote {
                NewVisitNoteView(shiftId: shift.id, clientId: shift.clientId, template: template)
            }
        }
        .task {
            await templateViewModel.loadTemplates()
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
        print("handleAddNote: \(templates.count) templates available")
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

    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        let name = authManager.currentUser?.firstName ?? "there"

        switch hour {
        case 0..<12: return "Good morning, \(name)"
        case 12..<17: return "Good afternoon, \(name)"
        default: return "Good evening, \(name)"
        }
    }
}

// MARK: - Active Shift Card
struct ActiveShiftCard: View {
    let shift: Shift
    let onCheckOut: () -> Void
    @State private var elapsedTime: TimeInterval = 0
    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    var body: some View {
        CarebaseCard(backgroundColor: Color.Carebase.success) {
            VStack(spacing: Spacing.md) {
                HStack {
                    VStack(alignment: .leading, spacing: Spacing.xxs) {
                        HStack(spacing: Spacing.xs) {
                            DotIndicator(color: .white, isPulsing: true)
                            Text("SHIFT IN PROGRESS")
                                .font(.Carebase.labelSmall)
                                .fontWeight(.bold)
                        }

                        Text(shift.client?.fullName ?? "Client")
                            .font(.Carebase.headlineLarge)
                    }
                    .foregroundColor(.white)

                    Spacer()

                    // Timer
                    VStack(alignment: .trailing, spacing: Spacing.xxs) {
                        Text(formatElapsedTime(elapsedTime))
                            .font(.Carebase.monoLarge)
                            .foregroundColor(.white)
                        Text("elapsed")
                            .font(.Carebase.caption)
                            .foregroundColor(.white.opacity(0.7))
                    }
                }

                // Action Buttons
                HStack(spacing: Spacing.sm) {
                    NavigationLink(destination: ShiftDetailView(shiftId: shift.id)) {
                        HStack {
                            Image(systemName: "info.circle.fill")
                            Text("Details")
                        }
                        .font(.Carebase.labelMedium)
                        .foregroundColor(Color.Carebase.success)
                        .frame(maxWidth: .infinity)
                        .frame(height: 44)
                        .background(Color.white)
                        .cornerRadius(CornerRadius.md)
                    }

                    Button(action: onCheckOut) {
                        HStack {
                            Image(systemName: "arrow.right.square.fill")
                            Text("Check Out")
                        }
                        .font(.Carebase.labelMedium)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 44)
                        .background(Color.white.opacity(0.2))
                        .cornerRadius(CornerRadius.md)
                    }
                }
            }
        }
        .screenPadding()
        .onReceive(timer) { _ in
            if let actualStart = shift.actualStart {
                elapsedTime = Date().timeIntervalSince(actualStart)
            }
        }
    }

    private func formatElapsedTime(_ interval: TimeInterval) -> String {
        let hours = Int(interval) / 3600
        let minutes = Int(interval) / 60 % 60
        let seconds = Int(interval) % 60
        return String(format: "%02d:%02d:%02d", hours, minutes, seconds)
    }
}

// MARK: - Today's Overview Section
struct TodayOverviewSection: View {
    @ObservedObject var viewModel: DashboardViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            Text("Today")
                .font(.Carebase.headlineMedium)
                .foregroundColor(Color.Carebase.textPrimary)
                .screenPadding()

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Spacing.sm) {
                    InfoCard(
                        icon: "calendar.badge.clock",
                        title: "Shifts Today",
                        value: "\(viewModel.todayShiftsCount)",
                        color: Color.Carebase.accent
                    )
                    .frame(width: 160)

                    InfoCard(
                        icon: "clock.fill",
                        title: "Hours",
                        value: viewModel.todayHours,
                        color: Color.Carebase.info
                    )
                    .frame(width: 160)

                    InfoCard(
                        icon: "doc.text.fill",
                        title: "Notes Due",
                        value: "\(viewModel.pendingNotesCount)",
                        color: viewModel.pendingNotesCount > 0 ? Color.Carebase.warning : Color.Carebase.success
                    )
                    .frame(width: 160)
                }
                .padding(.horizontal, Spacing.screenHorizontal)
            }
        }
    }
}

// MARK: - Next Shift Section
struct NextShiftSection: View {
    let shift: Shift
    var canCheckIn: Bool = false
    var onCheckIn: (() -> Void)? = nil

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            HStack {
                Text(shift.isToday ? "Today's Shift" : "Next Shift")
                    .font(.Carebase.headlineMedium)
                    .foregroundColor(Color.Carebase.textPrimary)

                Spacer()

                NavigationLink(destination: ShiftsView()) {
                    Text("View All")
                        .font(.Carebase.labelMedium)
                        .foregroundColor(Color.Carebase.accent)
                }
            }
            .screenPadding()

            // Shift Card with Check-In
            CarebaseCard {
                VStack(spacing: Spacing.md) {
                    NavigationLink(destination: ShiftDetailView(shiftId: shift.id)) {
                        HStack(spacing: Spacing.md) {
                            Avatar(name: shift.client?.fullName ?? "Client", size: 56)

                            VStack(alignment: .leading, spacing: Spacing.xxs) {
                                Text(shift.client?.fullName ?? "Client")
                                    .font(.Carebase.headlineSmall)
                                    .foregroundColor(Color.Carebase.textPrimary)

                                Text(shift.timeRangeFormatted)
                                    .font(.Carebase.bodySmall)
                                    .foregroundColor(Color.Carebase.textSecondary)

                                if let address = shift.client?.address {
                                    HStack(spacing: Spacing.xxs) {
                                        Image(systemName: "mappin")
                                            .font(.system(size: 10))
                                        Text(address)
                                            .lineLimit(1)
                                    }
                                    .font(.Carebase.caption)
                                    .foregroundColor(Color.Carebase.textTertiary)
                                }
                            }

                            Spacer()

                            Image(systemName: "chevron.right")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(Color.Carebase.textTertiary)
                        }
                    }
                    .buttonStyle(.plain)

                    // Check-In Button (only for today's scheduled shifts)
                    if canCheckIn, let onCheckIn = onCheckIn {
                        Button(action: {
                            HapticType.medium.trigger()
                            onCheckIn()
                        }) {
                            HStack {
                                Image(systemName: "checkmark.circle.fill")
                                Text("Check In Now")
                            }
                            .font(.Carebase.labelLarge)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 48)
                            .background(Color.Carebase.success)
                            .cornerRadius(CornerRadius.lg)
                        }
                    }
                }
            }
            .screenPadding()
        }
    }
}

// MARK: - Quick Actions Section
struct QuickActionsSection: View {
    var canCheckIn: Bool = false
    var onCheckIn: (() -> Void)? = nil

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            Text("Quick Actions")
                .font(.Carebase.headlineMedium)
                .foregroundColor(Color.Carebase.textPrimary)
                .screenPadding()

            HStack(spacing: Spacing.md) {
                QuickActionButton(
                    icon: "checkmark.circle.fill",
                    title: "Check In",
                    color: canCheckIn ? Color.Carebase.success : Color.Carebase.textTertiary,
                    isEnabled: canCheckIn
                ) {
                    onCheckIn?()
                }

                NavigationLink(destination: VisitNotesListView()) {
                    QuickActionContent(
                        icon: "doc.text.fill",
                        title: "Notes",
                        color: Color.Carebase.accent
                    )
                }
                .buttonStyle(ScaleButtonStyle())

                QuickActionButton(
                    icon: "phone.fill",
                    title: "Emergency",
                    color: Color.Carebase.error
                ) {
                    // Call emergency number
                    if let url = URL(string: "tel://911") {
                        UIApplication.shared.open(url)
                    }
                }
            }
            .screenPadding()
        }
    }
}

// Quick action content (for use with NavigationLink)
struct QuickActionContent: View {
    let icon: String
    let title: String
    let color: Color

    var body: some View {
        VStack(spacing: Spacing.sm) {
            Image(systemName: icon)
                .font(.system(size: 24, weight: .medium))
                .foregroundColor(color)
                .frame(width: 56, height: 56)
                .background(color.opacity(0.12))
                .clipShape(Circle())

            Text(title)
                .font(.Carebase.labelMedium)
                .foregroundColor(Color.Carebase.textPrimary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, Spacing.md)
        .background(Color.Carebase.surface)
        .cornerRadius(CornerRadius.lg)
        .carebaseShadow(.subtle)
    }
}

struct QuickActionButton: View {
    let icon: String
    let title: String
    let color: Color
    var isEnabled: Bool = true
    let action: () -> Void

    var body: some View {
        Button(action: {
            guard isEnabled else { return }
            HapticType.light.trigger()
            action()
        }) {
            VStack(spacing: Spacing.sm) {
                Image(systemName: icon)
                    .font(.system(size: 24, weight: .medium))
                    .foregroundColor(color)
                    .frame(width: 56, height: 56)
                    .background(color.opacity(0.12))
                    .clipShape(Circle())

                Text(title)
                    .font(.Carebase.labelMedium)
                    .foregroundColor(isEnabled ? Color.Carebase.textPrimary : Color.Carebase.textTertiary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, Spacing.md)
            .background(Color.Carebase.surface)
            .cornerRadius(CornerRadius.lg)
            .carebaseShadow(.subtle)
            .opacity(isEnabled ? 1.0 : 0.6)
        }
        .buttonStyle(ScaleButtonStyle())
        .disabled(!isEnabled)
    }
}

// MARK: - Recent Notes Section
struct RecentNotesSection: View {
    let notes: [VisitNote]

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            HStack {
                Text("Recent Notes")
                    .font(.Carebase.headlineMedium)
                    .foregroundColor(Color.Carebase.textPrimary)

                Spacer()

                NavigationLink(destination: VisitNotesListView()) {
                    Text("View All")
                        .font(.Carebase.labelMedium)
                        .foregroundColor(Color.Carebase.accent)
                }
            }
            .screenPadding()

            VStack(spacing: Spacing.sm) {
                ForEach(notes.prefix(3)) { note in
                    NotePreviewRow(note: note)
                }
            }
            .screenPadding()
        }
    }
}

struct NotePreviewRow: View {
    let note: VisitNote

    var body: some View {
        CarebaseCard(padding: Spacing.md) {
            HStack(spacing: Spacing.md) {
                Image(systemName: "doc.text.fill")
                    .font(.system(size: 18))
                    .foregroundColor(Color.Carebase.accent)
                    .frame(width: 40, height: 40)
                    .background(Color.Carebase.accentSoft)
                    .clipShape(Circle())

                VStack(alignment: .leading, spacing: Spacing.xxs) {
                    Text(note.templateName)
                        .font(.Carebase.bodyLarge)
                        .foregroundColor(Color.Carebase.textPrimary)

                    Text(note.client?.fullName ?? "Client")
                        .font(.Carebase.bodySmall)
                        .foregroundColor(Color.Carebase.textSecondary)
                }

                Spacer()

                Text(note.submittedAtFormatted)
                    .font(.Carebase.caption)
                    .foregroundColor(Color.Carebase.textTertiary)
            }
        }
    }
}

// MARK: - Notification Button
struct NotificationButton: View {
    @EnvironmentObject var appState: AppState

    var body: some View {
        NavigationLink(destination: NotificationsView()) {
            ZStack(alignment: .topTrailing) {
                Image(systemName: "bell.fill")
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(Color.Carebase.textPrimary)

                if appState.hasUnreadNotifications {
                    Circle()
                        .fill(Color.Carebase.error)
                        .frame(width: 8, height: 8)
                        .offset(x: 2, y: -2)
                }
            }
        }
    }
}

// MARK: - Dashboard View Model
@MainActor
class DashboardViewModel: ObservableObject {
    @Published var todayShifts: [Shift] = []
    @Published var upcomingShifts: [Shift] = []
    @Published var nextShift: Shift?
    @Published var activeShift: Shift?
    @Published var recentNotes: [VisitNote] = []
    @Published var isLoading = false
    @Published var isCheckingIn = false
    @Published var error: String?

    private let api = APIClient.shared

    var todayShiftsCount: Int { todayShifts.count }

    var todayHours: String {
        let totalSeconds = todayShifts.reduce(0.0) { $0 + $1.duration }
        let hours = totalSeconds / 3600
        return String(format: "%.1f", hours)
    }

    var pendingNotesCount: Int {
        // Count completed shifts that don't have notes yet
        let completedShiftsToday = todayShifts.filter { $0.status == .completed }
        let notesSubmittedToday = recentNotes.filter { Calendar.current.isDateInToday($0.submittedAt) }
        return max(0, completedShiftsToday.count - notesSubmittedToday.count)
    }

    func loadData() async {
        isLoading = true
        error = nil

        // Load shifts and notes in parallel
        async let shiftsTask: () = loadShifts()
        async let notesTask: () = loadRecentNotes()

        _ = await (shiftsTask, notesTask)

        isLoading = false
    }

    private func loadShifts() async {
        do {
            let response: ShiftsResponse = try await api.request(endpoint: .shifts)
            let allShifts = response.shifts

            // Filter today's shifts
            self.todayShifts = allShifts.filter { $0.isToday }

            // Find active shift (in progress)
            self.activeShift = allShifts.first { $0.status == .inProgress }

            // Filter upcoming shifts (scheduled, not today)
            self.upcomingShifts = allShifts.filter { $0.status == .scheduled && !$0.isToday }
                .sorted { $0.scheduledStart < $1.scheduledStart }

            // Next shift is the first scheduled shift (today or upcoming)
            let scheduledToday = todayShifts.filter { $0.status == .scheduled }
                .sorted { $0.scheduledStart < $1.scheduledStart }

            if let nextToday = scheduledToday.first {
                self.nextShift = nextToday
            } else if let nextUpcoming = upcomingShifts.first {
                self.nextShift = nextUpcoming
            } else {
                self.nextShift = nil
            }

            #if DEBUG
            print("Dashboard: Loaded \(allShifts.count) shifts, \(todayShifts.count) today, active: \(activeShift?.id ?? "none")")
            #endif
        } catch let apiError as APIError {
            self.error = apiError.errorDescription
            #if DEBUG
            print("Dashboard shifts error: \(apiError)")
            #endif
        } catch {
            self.error = "Failed to load shifts"
            #if DEBUG
            print("Dashboard shifts error: \(error)")
            #endif
        }
    }

    private func loadRecentNotes() async {
        do {
            let response: VisitNotesResponse = try await api.request(
                endpoint: .visitNotes,
                queryParams: ["limit": "10"]
            )
            self.recentNotes = response.visitNotes

            #if DEBUG
            print("Dashboard: Loaded \(response.visitNotes.count) recent notes")
            #endif
        } catch let apiError as APIError {
            // Don't set error for notes - shifts are more important
            #if DEBUG
            print("Dashboard notes error: \(apiError)")
            #endif
        } catch {
            #if DEBUG
            print("Dashboard notes error: \(error)")
            #endif
        }
    }

    func refresh() async {
        await loadData()
    }

    // MARK: - Check In/Out

    func checkIn() async {
        guard let shift = nextShift else { return }
        isCheckingIn = true
        error = nil

        do {
            let response: CheckInResponse = try await api.request(
                endpoint: .checkIn(shiftId: shift.id),
                method: .post
            )

            // Update local state
            self.activeShift = response.shift
            self.nextShift = nil

            // Refresh to get updated shift list
            await loadShifts()

            HapticType.success.trigger()

            #if DEBUG
            print("Dashboard: Checked in to shift \(shift.id)")
            #endif
        } catch let apiError as APIError {
            self.error = apiError.errorDescription
            HapticType.error.trigger()
            #if DEBUG
            print("Dashboard check-in error: \(apiError)")
            #endif
        } catch {
            self.error = "Failed to check in"
            HapticType.error.trigger()
            #if DEBUG
            print("Dashboard check-in error: \(error)")
            #endif
        }

        isCheckingIn = false
    }

    func checkOut() async {
        guard let shift = activeShift else { return }
        isCheckingIn = true
        error = nil

        do {
            let _: CheckOutResponse = try await api.request(
                endpoint: .checkOut(shiftId: shift.id),
                method: .post
            )

            // Clear active shift
            self.activeShift = nil

            // Refresh to get updated shift list
            await loadShifts()

            HapticType.success.trigger()

            #if DEBUG
            print("Dashboard: Checked out of shift \(shift.id)")
            #endif
        } catch let apiError as APIError {
            self.error = apiError.errorDescription
            HapticType.error.trigger()
            #if DEBUG
            print("Dashboard check-out error: \(apiError)")
            #endif
        } catch {
            self.error = "Failed to check out"
            HapticType.error.trigger()
            #if DEBUG
            print("Dashboard check-out error: \(error)")
            #endif
        }

        isCheckingIn = false
    }

    func hasVisitNoteForActiveShift() async -> Bool {
        guard let shift = activeShift else { return true }

        do {
            let response: VisitNotesResponse = try await api.request(
                endpoint: .visitNotes,
                queryParams: ["shiftId": shift.id, "limit": "1"]
            )
            let hasNote = !response.visitNotes.isEmpty

            #if DEBUG
            print("Dashboard: Shift \(shift.id) has visit note: \(hasNote)")
            #endif

            return hasNote
        } catch {
            #if DEBUG
            print("Dashboard: Error checking visit notes: \(error)")
            #endif
            // If we can't check, don't block checkout
            return true
        }
    }
}

#Preview {
    DashboardView()
        .environmentObject(AuthenticationManager())
        .environmentObject(AppState())
}
