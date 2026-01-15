import SwiftUI

// MARK: - Text Field
// Clean, minimal text input with clear states
// Floating label for context without clutter

struct CarebaseTextField: View {
    let label: String
    let placeholder: String
    @Binding var text: String
    var icon: String?
    var isSecure: Bool
    var keyboardType: UIKeyboardType
    var errorMessage: String?
    var helperText: String?

    @FocusState private var isFocused: Bool
    @State private var isSecureVisible = false

    init(
        _ label: String,
        placeholder: String = "",
        text: Binding<String>,
        icon: String? = nil,
        isSecure: Bool = false,
        keyboardType: UIKeyboardType = .default,
        errorMessage: String? = nil,
        helperText: String? = nil
    ) {
        self.label = label
        self.placeholder = placeholder.isEmpty ? label : placeholder
        self._text = text
        self.icon = icon
        self.isSecure = isSecure
        self.keyboardType = keyboardType
        self.errorMessage = errorMessage
        self.helperText = helperText
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            // Label
            Text(label)
                .font(.Carebase.labelMedium)
                .foregroundColor(labelColor)

            // Input Container
            HStack(spacing: Spacing.sm) {
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.system(size: 18, weight: .medium))
                        .foregroundColor(iconColor)
                        .frame(width: 24)
                }

                Group {
                    if isSecure && !isSecureVisible {
                        SecureField(placeholder, text: $text)
                    } else {
                        TextField(placeholder, text: $text)
                    }
                }
                .font(.Carebase.bodyLarge)
                .foregroundColor(Color.Carebase.textPrimary)
                .keyboardType(keyboardType)
                .textInputAutocapitalization(keyboardType == .emailAddress ? .never : .sentences)
                .autocorrectionDisabled(isSecure || keyboardType == .emailAddress)
                .focused($isFocused)

                if isSecure {
                    Button(action: { isSecureVisible.toggle() }) {
                        Image(systemName: isSecureVisible ? "eye.slash.fill" : "eye.fill")
                            .font(.system(size: 16, weight: .medium))
                            .foregroundColor(Color.Carebase.textTertiary)
                    }
                }

                if !text.isEmpty && !isSecure {
                    Button(action: { text = "" }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 16, weight: .medium))
                            .foregroundColor(Color.Carebase.textTertiary)
                    }
                }
            }
            .padding(.horizontal, Spacing.md)
            .frame(height: 56)
            .background(Color.Carebase.backgroundSecondary)
            .cornerRadius(CornerRadius.lg)
            .overlay(
                RoundedRectangle(cornerRadius: CornerRadius.lg)
                    .stroke(borderColor, lineWidth: isFocused ? 2 : 1)
            )

            // Helper/Error Text
            if let error = errorMessage {
                HStack(spacing: Spacing.xxs) {
                    Image(systemName: "exclamationmark.circle.fill")
                        .font(.system(size: 12))
                    Text(error)
                        .font(.Carebase.caption)
                }
                .foregroundColor(Color.Carebase.error)
            } else if let helper = helperText {
                Text(helper)
                    .font(.Carebase.caption)
                    .foregroundColor(Color.Carebase.textTertiary)
            }
        }
        .animation(.easeInOut(duration: 0.2), value: isFocused)
    }

    private var labelColor: Color {
        if errorMessage != nil {
            return Color.Carebase.error
        }
        return isFocused ? Color.Carebase.accent : Color.Carebase.textSecondary
    }

    private var borderColor: Color {
        if errorMessage != nil {
            return Color.Carebase.error
        }
        return isFocused ? Color.Carebase.accent : Color.Carebase.border
    }

    private var iconColor: Color {
        if errorMessage != nil {
            return Color.Carebase.error
        }
        return isFocused ? Color.Carebase.accent : Color.Carebase.textTertiary
    }
}

// MARK: - Text Area
struct CarebaseTextArea: View {
    let label: String
    let placeholder: String
    @Binding var text: String
    var minHeight: CGFloat
    var errorMessage: String?

    @FocusState private var isFocused: Bool

    init(
        _ label: String,
        placeholder: String = "",
        text: Binding<String>,
        minHeight: CGFloat = 120,
        errorMessage: String? = nil
    ) {
        self.label = label
        self.placeholder = placeholder.isEmpty ? label : placeholder
        self._text = text
        self.minHeight = minHeight
        self.errorMessage = errorMessage
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            Text(label)
                .font(.Carebase.labelMedium)
                .foregroundColor(labelColor)

            ZStack(alignment: .topLeading) {
                if text.isEmpty {
                    Text(placeholder)
                        .font(.Carebase.bodyLarge)
                        .foregroundColor(Color.Carebase.textTertiary)
                        .padding(.horizontal, Spacing.md)
                        .padding(.vertical, Spacing.md)
                }

                TextEditor(text: $text)
                    .font(.Carebase.bodyLarge)
                    .foregroundColor(Color.Carebase.textPrimary)
                    .scrollContentBackground(.hidden)
                    .padding(.horizontal, Spacing.sm)
                    .padding(.vertical, Spacing.sm)
                    .focused($isFocused)
            }
            .frame(minHeight: minHeight)
            .background(Color.Carebase.backgroundSecondary)
            .cornerRadius(CornerRadius.lg)
            .overlay(
                RoundedRectangle(cornerRadius: CornerRadius.lg)
                    .stroke(borderColor, lineWidth: isFocused ? 2 : 1)
            )

            if let error = errorMessage {
                HStack(spacing: Spacing.xxs) {
                    Image(systemName: "exclamationmark.circle.fill")
                        .font(.system(size: 12))
                    Text(error)
                        .font(.Carebase.caption)
                }
                .foregroundColor(Color.Carebase.error)
            }
        }
    }

    private var labelColor: Color {
        if errorMessage != nil { return Color.Carebase.error }
        return isFocused ? Color.Carebase.accent : Color.Carebase.textSecondary
    }

    private var borderColor: Color {
        if errorMessage != nil { return Color.Carebase.error }
        return isFocused ? Color.Carebase.accent : Color.Carebase.border
    }
}

#Preview {
    VStack(spacing: 24) {
        CarebaseTextField(
            "Email",
            text: .constant("john@example.com"),
            icon: "envelope.fill",
            keyboardType: .emailAddress
        )

        CarebaseTextField(
            "Password",
            text: .constant("password123"),
            icon: "lock.fill",
            isSecure: true
        )

        CarebaseTextField(
            "Phone Number",
            text: .constant(""),
            icon: "phone.fill",
            errorMessage: "Please enter a valid phone number"
        )

        CarebaseTextArea(
            "Notes",
            placeholder: "Add any additional notes...",
            text: .constant("")
        )
    }
    .padding()
}
