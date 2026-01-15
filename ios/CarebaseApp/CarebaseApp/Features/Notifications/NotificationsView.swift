import SwiftUI

// MARK: - Notifications View
// Clear, scannable notification list
// Easy to see what needs attention

struct NotificationsView: View {
    @StateObject private var viewModel = NotificationsViewModel()
    @EnvironmentObject var appState: AppState

    var body: some View {
        Group {
            if viewModel.isLoading && viewModel.notifications.isEmpty {
                LoadingView()
            } else if viewModel.notifications.isEmpty {
                EmptyNotificationsView()
            } else {
                NotificationsList(
                    notifications: viewModel.notifications,
                    onMarkRead: { notification in
                        Task { await viewModel.markAsRead(notification) }
                    }
                )
            }
        }
        .background(Color.Carebase.backgroundSecondary)
        .navigationTitle("Notifications")
        .navigationBarTitleDisplayMode(.large)
        .toolbar {
            if !viewModel.notifications.isEmpty {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Mark All Read") {
                        Task { await viewModel.markAllAsRead() }
                    }
                    .font(.Carebase.labelMedium)
                }
            }
        }
        .refreshable {
            await viewModel.refresh()
        }
        .task {
            await viewModel.loadNotifications()
        }
        .onChange(of: viewModel.unreadCount) { _, count in
            appState.hasUnreadNotifications = count > 0
        }
    }
}

// MARK: - Notifications List
struct NotificationsList: View {
    let notifications: [AppNotification]
    let onMarkRead: (AppNotification) -> Void

    var body: some View {
        ScrollView {
            LazyVStack(spacing: Spacing.sm) {
                ForEach(groupedNotifications, id: \.date) { group in
                    Section {
                        ForEach(group.notifications) { notification in
                            NotificationRow(notification: notification)
                                .onTapGesture {
                                    if !notification.isRead {
                                        onMarkRead(notification)
                                    }
                                }
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

    private var groupedNotifications: [NotificationGroup] {
        let calendar = Calendar.current
        let grouped = Dictionary(grouping: notifications) { notification in
            calendar.startOfDay(for: notification.createdAt)
        }

        return grouped.map { date, notifications in
            NotificationGroup(date: date, notifications: notifications.sorted { $0.createdAt > $1.createdAt })
        }.sorted { $0.date > $1.date }
    }
}

struct NotificationGroup {
    let date: Date
    let notifications: [AppNotification]

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

// MARK: - Notification Row
struct NotificationRow: View {
    let notification: AppNotification

    var body: some View {
        HStack(alignment: .top, spacing: Spacing.md) {
            // Icon
            ZStack {
                Circle()
                    .fill(iconBackgroundColor)
                    .frame(width: 44, height: 44)

                Image(systemName: notification.icon)
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(iconColor)
            }

            // Content
            VStack(alignment: .leading, spacing: Spacing.xxs) {
                HStack {
                    Text(notification.title)
                        .font(.Carebase.bodyLarge)
                        .fontWeight(notification.isRead ? .regular : .semibold)
                        .foregroundColor(Color.Carebase.textPrimary)

                    Spacer()

                    if !notification.isRead {
                        Circle()
                            .fill(Color.Carebase.accent)
                            .frame(width: 8, height: 8)
                    }
                }

                Text(notification.message)
                    .font(.Carebase.bodySmall)
                    .foregroundColor(Color.Carebase.textSecondary)
                    .lineLimit(2)

                Text(timeAgo(notification.createdAt))
                    .font(.Carebase.caption)
                    .foregroundColor(Color.Carebase.textTertiary)
            }
        }
        .padding(Spacing.md)
        .background(notification.isRead ? Color.Carebase.surface : Color.Carebase.accentSoft.opacity(0.3))
        .cornerRadius(CornerRadius.lg)
    }

    private var iconColor: Color {
        switch notification.type.uppercased() {
        case "SHIFT_REMINDER", "SHIFT_ASSIGNED": return Color.Carebase.accent
        case "SHIFT_CANCELLED": return Color.Carebase.error
        case "VISIT_NOTE_REMINDER": return Color.Carebase.warning
        case "MESSAGE": return Color.Carebase.info
        default: return Color.Carebase.textSecondary
        }
    }

    private var iconBackgroundColor: Color {
        iconColor.opacity(0.12)
    }

    private func timeAgo(_ date: Date) -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: date, relativeTo: Date())
    }
}

// MARK: - Empty Notifications View
struct EmptyNotificationsView: View {
    var body: some View {
        VStack(spacing: Spacing.lg) {
            Spacer()

            Image(systemName: "bell.slash")
                .font(.system(size: 64, weight: .light))
                .foregroundColor(Color.Carebase.textTertiary)

            VStack(spacing: Spacing.xs) {
                Text("All caught up!")
                    .font(.Carebase.headlineMedium)
                    .foregroundColor(Color.Carebase.textPrimary)

                Text("You don't have any notifications right now.")
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
class NotificationsViewModel: ObservableObject {
    @Published var notifications: [AppNotification] = []
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIClient.shared

    var unreadCount: Int {
        notifications.filter { !$0.isRead }.count
    }

    func loadNotifications() async {
        isLoading = true
        error = nil

        do {
            let response: NotificationsResponse = try await api.request(endpoint: .notifications)
            self.notifications = response.notifications
        } catch let apiError as APIError {
            self.error = apiError.errorDescription
        } catch {
            self.error = "Failed to load notifications"
        }

        isLoading = false
    }

    func markAsRead(_ notification: AppNotification) async {
        do {
            let request = MarkNotificationsRequest(notificationIds: [notification.id], markAllRead: nil)
            let _: NotificationsResponse = try await api.request(
                endpoint: .notifications,
                method: .patch,
                body: request
            )
            // Reload to get updated state
            await loadNotifications()
        } catch {
            // Silently fail - UI will reflect actual state on next refresh
        }
    }

    func markAllAsRead() async {
        do {
            let request = MarkNotificationsRequest(notificationIds: nil, markAllRead: true)
            let _: NotificationsResponse = try await api.request(
                endpoint: .notifications,
                method: .patch,
                body: request
            )
            // Reload to get updated state
            await loadNotifications()
        } catch {
            // Silently fail
        }
    }

    func refresh() async {
        await loadNotifications()
    }
}

#Preview {
    NavigationStack {
        NotificationsView()
            .environmentObject(AppState())
    }
}
