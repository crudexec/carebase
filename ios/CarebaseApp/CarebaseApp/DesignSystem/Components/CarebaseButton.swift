import SwiftUI

// MARK: - Button Styles
// Clean, clear buttons with generous touch targets
// Subtle animations for tactile feedback

struct CarebaseButton: View {
    enum Style {
        case primary
        case secondary
        case tertiary
        case destructive
    }

    enum Size {
        case small
        case medium
        case large

        var height: CGFloat {
            switch self {
            case .small: return 36
            case .medium: return 48
            case .large: return 56
            }
        }

        var font: Font {
            switch self {
            case .small: return .Carebase.labelMedium
            case .medium: return .Carebase.labelLarge
            case .large: return .Carebase.headlineSmall
            }
        }

        var horizontalPadding: CGFloat {
            switch self {
            case .small: return 16
            case .medium: return 24
            case .large: return 32
            }
        }
    }

    let title: String
    let icon: String?
    let style: Style
    let size: Size
    let isFullWidth: Bool
    let isLoading: Bool
    let action: () -> Void

    @State private var isPressed = false

    init(
        _ title: String,
        icon: String? = nil,
        style: Style = .primary,
        size: Size = .medium,
        isFullWidth: Bool = false,
        isLoading: Bool = false,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.icon = icon
        self.style = style
        self.size = size
        self.isFullWidth = isFullWidth
        self.isLoading = isLoading
        self.action = action
    }

    var body: some View {
        Button(action: {
            let impactLight = UIImpactFeedbackGenerator(style: .light)
            impactLight.impactOccurred()
            action()
        }) {
            HStack(spacing: Spacing.xs) {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: foregroundColor))
                        .scaleEffect(0.8)
                } else {
                    if let icon = icon {
                        Image(systemName: icon)
                            .font(size.font)
                    }
                    Text(title)
                        .font(size.font)
                        .fontWeight(.semibold)
                }
            }
            .foregroundColor(foregroundColor)
            .frame(maxWidth: isFullWidth ? .infinity : nil)
            .frame(height: size.height)
            .padding(.horizontal, size.horizontalPadding)
            .background(backgroundColor)
            .cornerRadius(CornerRadius.lg)
            .overlay(
                RoundedRectangle(cornerRadius: CornerRadius.lg)
                    .stroke(borderColor, lineWidth: style == .secondary ? 1.5 : 0)
            )
        }
        .buttonStyle(ScaleButtonStyle())
        .disabled(isLoading)
        .opacity(isLoading ? 0.7 : 1)
    }

    private var backgroundColor: Color {
        switch style {
        case .primary: return Color.Carebase.accent
        case .secondary: return Color.clear
        case .tertiary: return Color.Carebase.accentSoft
        case .destructive: return Color.Carebase.error
        }
    }

    private var foregroundColor: Color {
        switch style {
        case .primary: return .white
        case .secondary: return Color.Carebase.accent
        case .tertiary: return Color.Carebase.accent
        case .destructive: return .white
        }
    }

    private var borderColor: Color {
        switch style {
        case .secondary: return Color.Carebase.accent.opacity(0.3)
        default: return .clear
        }
    }
}

// MARK: - Scale Button Style
struct ScaleButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .animation(.easeInOut(duration: 0.15), value: configuration.isPressed)
    }
}

// MARK: - Icon Button
struct CarebaseIconButton: View {
    let icon: String
    let size: CGFloat
    let color: Color
    let backgroundColor: Color
    let action: () -> Void

    init(
        icon: String,
        size: CGFloat = 44,
        color: Color = Color.Carebase.accent,
        backgroundColor: Color = Color.Carebase.accentSoft,
        action: @escaping () -> Void
    ) {
        self.icon = icon
        self.size = size
        self.color = color
        self.backgroundColor = backgroundColor
        self.action = action
    }

    var body: some View {
        Button(action: {
            let impactLight = UIImpactFeedbackGenerator(style: .light)
            impactLight.impactOccurred()
            action()
        }) {
            Image(systemName: icon)
                .font(.system(size: size * 0.4, weight: .medium))
                .foregroundColor(color)
                .frame(width: size, height: size)
                .background(backgroundColor)
                .clipShape(Circle())
        }
        .buttonStyle(ScaleButtonStyle())
    }
}

#Preview {
    VStack(spacing: 20) {
        CarebaseButton("Check In", icon: "checkmark.circle.fill", style: .primary, isFullWidth: true) {}
        CarebaseButton("View Details", style: .secondary) {}
        CarebaseButton("Add Note", icon: "plus", style: .tertiary) {}
        CarebaseButton("Cancel Shift", style: .destructive) {}
        CarebaseButton("Loading...", isLoading: true) {}
    }
    .padding()
}
