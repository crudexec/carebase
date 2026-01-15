import SwiftUI

// MARK: - Authentication View
// Clean, focused login experience
// Nothing distracts from the task at hand

struct AuthenticationView: View {
    @EnvironmentObject var authManager: AuthenticationManager

    @State private var email = ""
    @State private var password = ""
    @State private var emailError: String?
    @State private var passwordError: String?
    @FocusState private var focusedField: Field?

    enum Field {
        case email, password
    }

    var body: some View {
        GeometryReader { geometry in
            ScrollView {
                VStack(spacing: 0) {
                    Spacer(minLength: geometry.size.height * 0.1)

                    // Logo & Welcome
                    VStack(spacing: Spacing.md) {
                        // App Icon
                        ZStack {
                            Circle()
                                .fill(
                                    LinearGradient(
                                        colors: [Color.Carebase.accent, Color.Carebase.accent.opacity(0.8)],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    )
                                )
                                .frame(width: 80, height: 80)

                            Image(systemName: "heart.text.square.fill")
                                .font(.system(size: 36, weight: .medium))
                                .foregroundColor(.white)
                        }
                        .carebaseShadow(.elevated)

                        VStack(spacing: Spacing.xs) {
                            Text("Carebase")
                                .font(.Carebase.displayMedium)
                                .foregroundColor(Color.Carebase.textPrimary)

                            Text("Care management, simplified")
                                .font(.Carebase.bodyMedium)
                                .foregroundColor(Color.Carebase.textSecondary)
                        }
                    }
                    .padding(.bottom, Spacing.xxxl)

                    // Login Form
                    VStack(spacing: Spacing.lg) {
                        CarebaseTextField(
                            "Email",
                            placeholder: "Enter your email",
                            text: $email,
                            icon: "envelope.fill",
                            keyboardType: .emailAddress,
                            errorMessage: emailError
                        )
                        .focused($focusedField, equals: .email)
                        .submitLabel(.next)
                        .onSubmit { focusedField = .password }

                        CarebaseTextField(
                            "Password",
                            placeholder: "Enter your password",
                            text: $password,
                            icon: "lock.fill",
                            isSecure: true,
                            errorMessage: passwordError
                        )
                        .focused($focusedField, equals: .password)
                        .submitLabel(.go)
                        .onSubmit { login() }

                        // Error Message
                        if let error = authManager.error {
                            HStack(spacing: Spacing.xs) {
                                Image(systemName: "exclamationmark.triangle.fill")
                                    .font(.system(size: 14))
                                Text(error)
                                    .font(.Carebase.bodySmall)
                            }
                            .foregroundColor(Color.Carebase.error)
                            .padding(.vertical, Spacing.sm)
                            .padding(.horizontal, Spacing.md)
                            .frame(maxWidth: .infinity)
                            .background(Color.Carebase.errorSoft)
                            .cornerRadius(CornerRadius.md)
                        }

                        // Login Button
                        CarebaseButton(
                            "Sign In",
                            icon: "arrow.right",
                            style: .primary,
                            size: .large,
                            isFullWidth: true,
                            isLoading: authManager.isLoading
                        ) {
                            login()
                        }
                        .padding(.top, Spacing.sm)

                        // Forgot Password
                        Button(action: { /* TODO: Implement forgot password */ }) {
                            Text("Forgot your password?")
                                .font(.Carebase.bodyMedium)
                                .foregroundColor(Color.Carebase.accent)
                        }
                        .padding(.top, Spacing.xs)
                    }
                    .screenPadding()

                    Spacer(minLength: Spacing.xxxl)

                    // Footer
                    VStack(spacing: Spacing.xs) {
                        Text("Need help? Contact your administrator")
                            .font(.Carebase.caption)
                            .foregroundColor(Color.Carebase.textTertiary)
                    }
                    .padding(.bottom, Spacing.xl)
                }
                .frame(minHeight: geometry.size.height)
            }
        }
        .background(Color.Carebase.background)
        .ignoresSafeArea(.keyboard)
        .onTapGesture {
            focusedField = nil
        }
    }

    // MARK: - Login
    private func login() {
        // Clear previous errors
        emailError = nil
        passwordError = nil

        // Validate
        var isValid = true

        if email.isEmpty {
            emailError = "Email is required"
            isValid = false
        } else if !isValidEmail(email) {
            emailError = "Please enter a valid email"
            isValid = false
        }

        if password.isEmpty {
            passwordError = "Password is required"
            isValid = false
        } else if password.count < 6 {
            passwordError = "Password must be at least 6 characters"
            isValid = false
        }

        guard isValid else {
            HapticType.warning.trigger()
            return
        }

        // Dismiss keyboard
        focusedField = nil

        // Attempt login
        Task {
            await authManager.login(email: email, password: password)
        }
    }

    private func isValidEmail(_ email: String) -> Bool {
        let emailRegex = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}"
        let predicate = NSPredicate(format: "SELF MATCHES %@", emailRegex)
        return predicate.evaluate(with: email)
    }
}

#Preview {
    AuthenticationView()
        .environmentObject(AuthenticationManager())
}
