import SwiftUI

// MARK: - Shifts View
// Clear, organized view of all shifts
// Easy to scan and find what's needed

struct ShiftsView: View {
    @StateObject private var viewModel = ShiftsViewModel()
    @StateObject private var templateViewModel = TemplateSelectionViewModel()
    @State private var selectedFilter: ShiftFilter = .today
    @State private var shiftToCheckIn: Shift?
    @State private var shiftToCheckOut: Shift?
    @State private var showNoNoteWarning = false
    @State private var pendingCheckoutShift: Shift?
    // Template selection state
    @State private var showTemplateSelector = false
    @State private var showNoTemplatesAlert = false
    @State private var shiftForNote: Shift?
    @State private var selectedTemplateForNote: FormTemplate?

    enum ShiftFilter: String, CaseIterable {
        case today = "Today"
        case upcoming = "Upcoming"
        case completed = "Completed"
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Filter Tabs
                FilterTabBar(selectedFilter: $selectedFilter)

                // Content
                if viewModel.isLoading && viewModel.shifts.isEmpty {
                    LoadingView()
                } else if filteredShifts.isEmpty {
                    EmptyStateView(filter: selectedFilter)
                } else {
                    ShiftsList(
                        shifts: filteredShifts,
                        onCheckIn: { shift in shiftToCheckIn = shift },
                        onCheckOut: { shift in shiftToCheckOut = shift },
                        onAddNote: { shift in
                            shiftForNote = shift
                            handleAddNote()
                        }
                    )
                }
            }
            .background(Color.Carebase.backgroundSecondary)
            .navigationTitle("Shifts")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        HapticType.light.trigger()
                        Task {
                            await viewModel.refresh()
                        }
                    }) {
                        Image(systemName: "arrow.clockwise")
                            .foregroundColor(Color.Carebase.accent)
                    }
                    .disabled(viewModel.isLoading)
                    .opacity(viewModel.isLoading ? 0.5 : 1.0)
                }
            }
            .refreshable {
                await viewModel.refresh()
            }
            .navigationDestination(isPresented: Binding(
                get: { selectedTemplateForNote != nil },
                set: { if !$0 { selectedTemplateForNote = nil; shiftForNote = nil } }
            )) {
                if let shift = shiftForNote, let template = selectedTemplateForNote {
                    NewVisitNoteView(shiftId: shift.id, clientId: shift.clientId, template: template)
                }
            }
        }
        .task {
            await viewModel.loadShifts()
        }
        .onAppear {
            // Refresh when returning to this view (e.g., from another tab)
            if !viewModel.shifts.isEmpty {
                Task {
                    await viewModel.refresh()
                }
            }
        }
        .task {
            await templateViewModel.loadTemplates()
        }
        .confirmationDialog(
            "Check In",
            isPresented: Binding(
                get: { shiftToCheckIn != nil },
                set: { if !$0 { shiftToCheckIn = nil } }
            ),
            titleVisibility: .visible
        ) {
            Button("Confirm Check In") {
                if let shift = shiftToCheckIn {
                    Task {
                        await viewModel.checkIn(shiftId: shift.id)
                    }
                }
                shiftToCheckIn = nil
            }
            Button("Cancel", role: .cancel) {
                shiftToCheckIn = nil
            }
        } message: {
            if let shift = shiftToCheckIn {
                Text("Start your shift with \(shift.client?.fullName ?? "client")?")
            }
        }
        .confirmationDialog(
            "Check Out",
            isPresented: Binding(
                get: { shiftToCheckOut != nil },
                set: { if !$0 { shiftToCheckOut = nil } }
            ),
            titleVisibility: .visible
        ) {
            Button("Confirm Check Out") {
                if let shift = shiftToCheckOut {
                    pendingCheckoutShift = shift
                    Task {
                        let hasNote = await viewModel.hasVisitNote(for: shift.id)
                        if hasNote {
                            await viewModel.checkOut(shiftId: shift.id)
                            pendingCheckoutShift = nil
                        } else {
                            showNoNoteWarning = true
                        }
                    }
                }
                shiftToCheckOut = nil
            }
            Button("Cancel", role: .cancel) {
                shiftToCheckOut = nil
            }
        } message: {
            Text("Are you sure you want to end this shift?")
        }
        .alert("No Visit Note", isPresented: $showNoNoteWarning) {
            Button("Add Note") {
                if let shift = pendingCheckoutShift {
                    shiftForNote = shift
                    handleAddNote()
                }
            }
            Button("Check Out Anyway", role: .destructive) {
                if let shift = pendingCheckoutShift {
                    Task {
                        await viewModel.checkOut(shiftId: shift.id)
                        pendingCheckoutShift = nil
                    }
                }
            }
            Button("Cancel", role: .cancel) {
                pendingCheckoutShift = nil
            }
        } message: {
            Text("You haven't submitted a visit note for this shift. Would you like to add one before checking out?")
        }
        .alert("No Forms Available", isPresented: $showNoTemplatesAlert) {
            Button("OK", role: .cancel) {
                shiftForNote = nil
            }
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
                    shiftForNote = nil
                }
            )
            .presentationDetents([.medium, .large])
            .presentationDragIndicator(.visible)
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

    private var filteredShifts: [Shift] {
        switch selectedFilter {
        case .today:
            return viewModel.shifts.filter { $0.isToday }
        case .upcoming:
            return viewModel.shifts.filter { $0.status == .scheduled && !$0.isToday }
        case .completed:
            return viewModel.shifts.filter { $0.status == .completed }
        }
    }
}

// MARK: - Filter Tab Bar
struct FilterTabBar: View {
    @Binding var selectedFilter: ShiftsView.ShiftFilter

    var body: some View {
        HStack(spacing: Spacing.xs) {
            ForEach(ShiftsView.ShiftFilter.allCases, id: \.self) { filter in
                FilterTab(
                    title: filter.rawValue,
                    isSelected: selectedFilter == filter
                ) {
                    withAnimation(.Carebase.quick) {
                        selectedFilter = filter
                    }
                    HapticType.selection.trigger()
                }
            }
        }
        .padding(.horizontal, Spacing.screenHorizontal)
        .padding(.vertical, Spacing.md)
        .background(Color.Carebase.background)
    }
}

struct FilterTab: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.Carebase.labelMedium)
                .foregroundColor(isSelected ? .white : Color.Carebase.textSecondary)
                .padding(.horizontal, Spacing.md)
                .padding(.vertical, Spacing.sm)
                .background(isSelected ? Color.Carebase.accent : Color.Carebase.backgroundSecondary)
                .cornerRadius(CornerRadius.full)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Shifts List
struct ShiftsList: View {
    let shifts: [Shift]
    var onCheckIn: ((Shift) -> Void)? = nil
    var onCheckOut: ((Shift) -> Void)? = nil
    var onAddNote: ((Shift) -> Void)? = nil

    var body: some View {
        ScrollView {
            LazyVStack(spacing: Spacing.sm) {
                ForEach(groupedShifts, id: \.date) { group in
                    Section {
                        ForEach(group.shifts) { shift in
                            ShiftRowWithActions(
                                shift: shift,
                                onCheckIn: onCheckIn,
                                onCheckOut: onCheckOut,
                                onAddNote: onAddNote
                            )
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

    private var groupedShifts: [ShiftGroup] {
        let calendar = Calendar.current
        let grouped = Dictionary(grouping: shifts) { shift in
            calendar.startOfDay(for: shift.scheduledStart)
        }

        return grouped.map { date, shifts in
            ShiftGroup(date: date, shifts: shifts.sorted { $0.scheduledStart < $1.scheduledStart })
        }.sorted { $0.date < $1.date }
    }
}

// MARK: - Shift Row With Actions
struct ShiftRowWithActions: View {
    let shift: Shift
    var onCheckIn: ((Shift) -> Void)? = nil
    var onCheckOut: ((Shift) -> Void)? = nil
    var onAddNote: ((Shift) -> Void)? = nil

    var body: some View {
        CarebaseCard {
            VStack(spacing: Spacing.md) {
                // Main shift info - tappable to go to detail
                NavigationLink(destination: ShiftDetailView(shiftId: shift.id)) {
                    HStack(spacing: Spacing.md) {
                        Avatar(name: shift.client?.fullName ?? "Client", size: 48)

                        VStack(alignment: .leading, spacing: Spacing.xxs) {
                            Text(shift.client?.fullName ?? "Client")
                                .font(.Carebase.bodyLarge)
                                .fontWeight(.medium)
                                .foregroundColor(Color.Carebase.textPrimary)

                            Text(shift.dateAndTimeFormatted)
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

                        VStack(alignment: .trailing, spacing: Spacing.xs) {
                            StatusBadge.shiftStatus(shift.status.badgeStatus)

                            Image(systemName: "chevron.right")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(Color.Carebase.textTertiary)
                        }
                    }
                }
                .buttonStyle(.plain)

                // Action buttons based on shift status
                if shift.isToday {
                    if shift.status == .scheduled {
                        Button(action: {
                            HapticType.medium.trigger()
                            onCheckIn?(shift)
                        }) {
                            HStack {
                                Image(systemName: "checkmark.circle.fill")
                                Text("Check In")
                            }
                            .font(.Carebase.labelMedium)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 40)
                            .background(Color.Carebase.success)
                            .cornerRadius(CornerRadius.md)
                        }
                    } else if shift.status == .inProgress {
                        HStack(spacing: Spacing.sm) {
                            Button(action: {
                                HapticType.light.trigger()
                                onAddNote?(shift)
                            }) {
                                HStack {
                                    Image(systemName: "doc.text.fill")
                                    Text("Add Note")
                                }
                                .font(.Carebase.labelMedium)
                                .foregroundColor(Color.Carebase.accent)
                                .frame(maxWidth: .infinity)
                                .frame(height: 40)
                                .background(Color.Carebase.accentSoft)
                                .cornerRadius(CornerRadius.md)
                            }

                            Button(action: {
                                HapticType.medium.trigger()
                                onCheckOut?(shift)
                            }) {
                                HStack {
                                    Image(systemName: "arrow.right.square.fill")
                                    Text("Check Out")
                                }
                                .font(.Carebase.labelMedium)
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .frame(height: 40)
                                .background(Color.Carebase.warning)
                                .cornerRadius(CornerRadius.md)
                            }
                        }
                    }
                }
            }
        }
    }
}

struct ShiftGroup {
    let date: Date
    let shifts: [Shift]

    var dateLabel: String {
        let calendar = Calendar.current
        if calendar.isDateInToday(date) {
            return "Today"
        } else if calendar.isDateInTomorrow(date) {
            return "Tomorrow"
        } else {
            let formatter = DateFormatter()
            formatter.dateFormat = "EEEE, MMM d"
            return formatter.string(from: date)
        }
    }
}

// MARK: - Loading View
struct LoadingView: View {
    var body: some View {
        VStack(spacing: Spacing.md) {
            ForEach(0..<3, id: \.self) { _ in
                SkeletonCard()
            }
        }
        .padding()
    }
}

// MARK: - Empty State View
struct EmptyStateView: View {
    let filter: ShiftsView.ShiftFilter

    var body: some View {
        VStack(spacing: Spacing.lg) {
            Spacer()

            Image(systemName: icon)
                .font(.system(size: 64, weight: .light))
                .foregroundColor(Color.Carebase.textTertiary)

            VStack(spacing: Spacing.xs) {
                Text(title)
                    .font(.Carebase.headlineMedium)
                    .foregroundColor(Color.Carebase.textPrimary)

                Text(subtitle)
                    .font(.Carebase.bodyMedium)
                    .foregroundColor(Color.Carebase.textSecondary)
                    .multilineTextAlignment(.center)
            }

            Spacer()
        }
        .padding()
    }

    private var icon: String {
        switch filter {
        case .today: return "calendar.badge.clock"
        case .upcoming: return "calendar"
        case .completed: return "checkmark.circle"
        }
    }

    private var title: String {
        switch filter {
        case .today: return "No shifts today"
        case .upcoming: return "No upcoming shifts"
        case .completed: return "No completed shifts"
        }
    }

    private var subtitle: String {
        switch filter {
        case .today: return "You don't have any shifts scheduled for today."
        case .upcoming: return "You don't have any upcoming shifts scheduled."
        case .completed: return "You haven't completed any shifts yet."
        }
    }
}

// MARK: - Shifts View Model
@MainActor
class ShiftsViewModel: ObservableObject {
    @Published var shifts: [Shift] = []
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIClient.shared

    func loadShifts() async {
        isLoading = true
        error = nil

        do {
            let response: ShiftsResponse = try await api.request(endpoint: .shifts)
            self.shifts = response.shifts
        } catch let apiError as APIError {
            self.error = apiError.errorDescription
        } catch {
            self.error = "Failed to load shifts"
        }

        isLoading = false
    }

    func refresh() async {
        await loadShifts()
    }

    func checkIn(shiftId: String) async -> Bool {
        do {
            let response: CheckInResponse = try await api.request(
                endpoint: .checkIn(shiftId: shiftId),
                method: .post
            )
            // Update local shift state
            if let index = shifts.firstIndex(where: { $0.id == shiftId }) {
                shifts[index] = response.shift
            }
            return response.success
        } catch {
            self.error = "Failed to check in"
            return false
        }
    }

    func checkOut(shiftId: String) async -> Bool {
        do {
            let response: CheckOutResponse = try await api.request(
                endpoint: .checkOut(shiftId: shiftId),
                method: .post
            )
            // Update local shift state
            if let index = shifts.firstIndex(where: { $0.id == shiftId }) {
                shifts[index] = response.shift
            }
            return response.success
        } catch {
            self.error = "Failed to check out"
            return false
        }
    }

    func hasVisitNote(for shiftId: String) async -> Bool {
        do {
            let response: VisitNotesResponse = try await api.request(
                endpoint: .visitNotes,
                queryParams: ["shiftId": shiftId, "limit": "1"]
            )
            return !response.visitNotes.isEmpty
        } catch {
            // Don't block checkout if we can't check
            return true
        }
    }
}

// MARK: - Template Selection View Model
@MainActor
class TemplateSelectionViewModel: ObservableObject {
    @Published var templates: [FormTemplate] = []
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIClient.shared

    func loadTemplates() async {
        isLoading = true
        error = nil

        do {
            let response: TemplatesResponse = try await api.request(endpoint: .enabledTemplates)
            self.templates = response.templates
        } catch let apiError as APIError {
            self.error = apiError.errorDescription
        } catch {
            self.error = "Failed to load templates"
        }

        isLoading = false
    }
}

#Preview {
    ShiftsView()
}
