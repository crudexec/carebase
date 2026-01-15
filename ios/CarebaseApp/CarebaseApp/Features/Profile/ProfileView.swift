import SwiftUI

// MARK: - Profile View
// Personal settings and preferences
// Easy access to important actions

struct ProfileView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @EnvironmentObject var appState: AppState
    @State private var showLogoutConfirmation = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: Spacing.xl) {
                    // Profile Header
                    ProfileHeader(user: authManager.currentUser)

                    // Stats
                    if let user = authManager.currentUser {
                        ProfileStats(user: user)
                    }

                    // Settings Sections
                    SettingsSections(appState: appState)

                    // Support Section
                    SupportSection()

                    // Logout Button
                    LogoutSection(showConfirmation: $showLogoutConfirmation)
                }
                .padding(.vertical, Spacing.lg)
            }
            .background(Color.Carebase.backgroundSecondary)
            .navigationTitle("Profile")
            .navigationBarTitleDisplayMode(.large)
            .confirmationDialog(
                "Sign Out",
                isPresented: $showLogoutConfirmation,
                titleVisibility: .visible
            ) {
                Button("Sign Out", role: .destructive) {
                    Task { await authManager.logout() }
                }
                Button("Cancel", role: .cancel) {}
            } message: {
                Text("Are you sure you want to sign out?")
            }
        }
    }
}

// MARK: - Profile Header
struct ProfileHeader: View {
    let user: User?

    var body: some View {
        VStack(spacing: Spacing.md) {
            Avatar(name: user?.fullName ?? "User", size: 100)

            VStack(spacing: Spacing.xs) {
                Text(user?.fullName ?? "User")
                    .font(.Carebase.displaySmall)
                    .foregroundColor(Color.Carebase.textPrimary)

                Text(user?.role.displayName ?? "Carer")
                    .font(.Carebase.bodyMedium)
                    .foregroundColor(Color.Carebase.textSecondary)

                Text(user?.email ?? "")
                    .font(.Carebase.bodySmall)
                    .foregroundColor(Color.Carebase.textTertiary)
            }

            NavigationLink(destination: EditProfileView()) {
                HStack(spacing: Spacing.xs) {
                    Image(systemName: "pencil")
                    Text("Edit Profile")
                }
                .font(.Carebase.labelMedium)
                .foregroundColor(Color.Carebase.accent)
                .padding(.horizontal, Spacing.md)
                .padding(.vertical, Spacing.sm)
                .background(Color.Carebase.accentSoft)
                .cornerRadius(CornerRadius.full)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, Spacing.lg)
        .background(Color.Carebase.surface)
    }
}

// MARK: - Profile Stats
struct ProfileStats: View {
    let user: User

    var body: some View {
        HStack(spacing: Spacing.md) {
            StatCard(value: "127", label: "Shifts", icon: "calendar")
            StatCard(value: "98%", label: "On Time", icon: "clock.fill")
            StatCard(value: "4.9", label: "Rating", icon: "star.fill")
        }
        .screenPadding()
    }
}

struct StatCard: View {
    let value: String
    let label: String
    let icon: String

    var body: some View {
        CarebaseCard(padding: Spacing.md) {
            VStack(spacing: Spacing.xs) {
                Image(systemName: icon)
                    .font(.system(size: 20, weight: .medium))
                    .foregroundColor(Color.Carebase.accent)

                Text(value)
                    .font(.Carebase.headlineMedium)
                    .foregroundColor(Color.Carebase.textPrimary)

                Text(label)
                    .font(.Carebase.caption)
                    .foregroundColor(Color.Carebase.textSecondary)
            }
            .frame(maxWidth: .infinity)
        }
    }
}

// MARK: - Settings Sections
struct SettingsSections: View {
    @ObservedObject var appState: AppState

    var body: some View {
        VStack(spacing: Spacing.lg) {
            // Preferences
            SettingsSection(title: "Preferences") {
                SettingsRow(
                    icon: "bell.fill",
                    title: "Notifications",
                    subtitle: "Manage notification preferences"
                ) {
                    // Navigate to notifications settings
                }

                Divider().padding(.leading, 60)

                SettingsRow(
                    icon: "moon.fill",
                    title: "Appearance",
                    subtitle: appState.colorScheme == .dark ? "Dark" : "Light",
                    trailing: {
                        AnyView(
                            Menu {
                                Button("Light") { appState.colorScheme = .light }
                                Button("Dark") { appState.colorScheme = .dark }
                                Button("System") { appState.colorScheme = nil }
                            } label: {
                                Image(systemName: "chevron.right")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(Color.Carebase.textTertiary)
                            }
                        )
                    }
                )
            }

            // Account
            SettingsSection(title: "Account") {
                SettingsRow(
                    icon: "lock.fill",
                    title: "Change Password",
                    subtitle: nil
                ) {
                    // Navigate to change password
                }

                Divider().padding(.leading, 60)

                SettingsRow(
                    icon: "shield.fill",
                    title: "Privacy",
                    subtitle: "Manage your data"
                ) {
                    // Navigate to privacy settings
                }
            }
        }
    }
}

struct SettingsSection<Content: View>: View {
    let title: String
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            Text(title)
                .font(.Carebase.labelMedium)
                .foregroundColor(Color.Carebase.textSecondary)
                .screenPadding()

            CarebaseCard(padding: 0) {
                VStack(spacing: 0) {
                    content
                }
            }
            .screenPadding()
        }
    }
}

struct SettingsRow<Trailing: View>: View {
    let icon: String
    let title: String
    let subtitle: String?
    let trailing: () -> Trailing
    let action: () -> Void

    init(
        icon: String,
        title: String,
        subtitle: String?,
        @ViewBuilder trailing: @escaping () -> Trailing = { EmptyView() as! Trailing },
        action: @escaping () -> Void = {}
    ) {
        self.icon = icon
        self.title = title
        self.subtitle = subtitle
        self.trailing = trailing
        self.action = action
    }

    var body: some View {
        Button(action: {
            HapticType.light.trigger()
            action()
        }) {
            HStack(spacing: Spacing.md) {
                Image(systemName: icon)
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(Color.Carebase.accent)
                    .frame(width: 36, height: 36)
                    .background(Color.Carebase.accentSoft)
                    .clipShape(Circle())

                VStack(alignment: .leading, spacing: Spacing.xxs) {
                    Text(title)
                        .font(.Carebase.bodyLarge)
                        .foregroundColor(Color.Carebase.textPrimary)

                    if let subtitle = subtitle {
                        Text(subtitle)
                            .font(.Carebase.bodySmall)
                            .foregroundColor(Color.Carebase.textSecondary)
                    }
                }

                Spacer()

                trailing()
            }
            .padding(Spacing.md)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Support Section
struct SupportSection: View {
    var body: some View {
        SettingsSection(title: "Support") {
            SettingsRow(
                icon: "questionmark.circle.fill",
                title: "Help Center",
                subtitle: "Get help with the app"
            ) {
                // Open help center
            }

            Divider().padding(.leading, 60)

            SettingsRow(
                icon: "envelope.fill",
                title: "Contact Support",
                subtitle: "Report issues or feedback"
            ) {
                // Open contact support
            }

            Divider().padding(.leading, 60)

            SettingsRow(
                icon: "doc.text.fill",
                title: "Terms of Service",
                subtitle: nil
            ) {
                // Open terms
            }
        }
    }
}

// MARK: - Logout Section
struct LogoutSection: View {
    @Binding var showConfirmation: Bool

    var body: some View {
        VStack(spacing: Spacing.md) {
            CarebaseButton(
                "Sign Out",
                icon: "arrow.right.square",
                style: .destructive,
                size: .large,
                isFullWidth: true
            ) {
                showConfirmation = true
            }

            Text("Carebase v1.0.0")
                .font(.Carebase.caption)
                .foregroundColor(Color.Carebase.textTertiary)
        }
        .screenPadding()
        .padding(.top, Spacing.lg)
    }
}

// MARK: - Edit Profile View
struct EditProfileView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @Environment(\.dismiss) private var dismiss

    @State private var firstName = ""
    @State private var lastName = ""
    @State private var phone = ""
    @State private var isSaving = false

    var body: some View {
        ScrollView {
            VStack(spacing: Spacing.xl) {
                // Avatar
                VStack(spacing: Spacing.md) {
                    Avatar(name: "\(firstName) \(lastName)", size: 100)

                    Button(action: { /* Change photo */ }) {
                        Text("Change Photo")
                            .font(.Carebase.labelMedium)
                            .foregroundColor(Color.Carebase.accent)
                    }
                }
                .padding(.vertical, Spacing.lg)

                // Form
                VStack(spacing: Spacing.lg) {
                    CarebaseTextField(
                        "First Name",
                        text: $firstName,
                        icon: "person.fill"
                    )

                    CarebaseTextField(
                        "Last Name",
                        text: $lastName,
                        icon: "person.fill"
                    )

                    CarebaseTextField(
                        "Phone Number",
                        text: $phone,
                        icon: "phone.fill",
                        keyboardType: .phonePad
                    )
                }
                .screenPadding()

                // Save Button
                CarebaseButton(
                    "Save Changes",
                    style: .primary,
                    size: .large,
                    isFullWidth: true,
                    isLoading: isSaving
                ) {
                    saveChanges()
                }
                .screenPadding()
            }
        }
        .background(Color.Carebase.backgroundSecondary)
        .navigationTitle("Edit Profile")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            if let user = authManager.currentUser {
                firstName = user.firstName
                lastName = user.lastName
                phone = user.phone ?? ""
            }
        }
    }

    private func saveChanges() {
        isSaving = true

        // Simulate save
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            isSaving = false
            HapticType.success.trigger()
            dismiss()
        }
    }
}

#Preview {
    ProfileView()
        .environmentObject(AuthenticationManager())
        .environmentObject(AppState())
}
