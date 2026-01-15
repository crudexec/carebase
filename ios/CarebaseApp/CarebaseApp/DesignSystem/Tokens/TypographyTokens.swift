import SwiftUI

// MARK: - Typography System
// Clean, readable type hierarchy using SF Pro
// Generous sizing for healthcare workers who may be on the move

extension Font {
    struct Carebase {
        // Display - for major headlines
        static let displayLarge = Font.system(size: 34, weight: .bold, design: .rounded)
        static let displayMedium = Font.system(size: 28, weight: .bold, design: .rounded)
        static let displaySmall = Font.system(size: 24, weight: .bold, design: .rounded)

        // Headlines - for section titles
        static let headlineLarge = Font.system(size: 22, weight: .semibold, design: .default)
        static let headlineMedium = Font.system(size: 20, weight: .semibold, design: .default)
        static let headlineSmall = Font.system(size: 17, weight: .semibold, design: .default)

        // Body - for main content
        static let bodyLarge = Font.system(size: 17, weight: .regular, design: .default)
        static let bodyMedium = Font.system(size: 15, weight: .regular, design: .default)
        static let bodySmall = Font.system(size: 13, weight: .regular, design: .default)

        // Labels - for UI elements
        static let labelLarge = Font.system(size: 15, weight: .medium, design: .default)
        static let labelMedium = Font.system(size: 13, weight: .medium, design: .default)
        static let labelSmall = Font.system(size: 11, weight: .medium, design: .default)

        // Caption - for supporting text
        static let caption = Font.system(size: 12, weight: .regular, design: .default)
        static let captionBold = Font.system(size: 12, weight: .semibold, design: .default)

        // Monospace - for times and codes
        static let mono = Font.system(size: 15, weight: .medium, design: .monospaced)
        static let monoLarge = Font.system(size: 34, weight: .light, design: .monospaced)
    }
}

// MARK: - Text Style Modifiers
struct CarebaseTextStyle: ViewModifier {
    enum Style {
        case displayLarge, displayMedium, displaySmall
        case headlineLarge, headlineMedium, headlineSmall
        case bodyLarge, bodyMedium, bodySmall
        case labelLarge, labelMedium, labelSmall
        case caption
    }

    let style: Style
    let color: Color

    func body(content: Content) -> some View {
        content
            .font(font)
            .foregroundColor(color)
            .tracking(tracking)
    }

    private var font: Font {
        switch style {
        case .displayLarge: return .Carebase.displayLarge
        case .displayMedium: return .Carebase.displayMedium
        case .displaySmall: return .Carebase.displaySmall
        case .headlineLarge: return .Carebase.headlineLarge
        case .headlineMedium: return .Carebase.headlineMedium
        case .headlineSmall: return .Carebase.headlineSmall
        case .bodyLarge: return .Carebase.bodyLarge
        case .bodyMedium: return .Carebase.bodyMedium
        case .bodySmall: return .Carebase.bodySmall
        case .labelLarge: return .Carebase.labelLarge
        case .labelMedium: return .Carebase.labelMedium
        case .labelSmall: return .Carebase.labelSmall
        case .caption: return .Carebase.caption
        }
    }

    private var tracking: CGFloat {
        switch style {
        case .displayLarge, .displayMedium, .displaySmall:
            return 0.35
        case .labelSmall, .caption:
            return 0.5
        default:
            return 0
        }
    }
}

extension View {
    func carebaseText(_ style: CarebaseTextStyle.Style, color: Color = Color.Carebase.textPrimary) -> some View {
        modifier(CarebaseTextStyle(style: style, color: color))
    }
}
