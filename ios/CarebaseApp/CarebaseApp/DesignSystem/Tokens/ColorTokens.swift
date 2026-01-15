import SwiftUI

// MARK: - Color Palette
// Inspired by Jony Ive's design philosophy: soft, warm, human colors
// that feel approachable and calming for healthcare workers

extension Color {
    // MARK: - Primary Brand
    static let carebasePrimary = Color("Primary", bundle: nil)
    static let carebaseSecondary = Color("Secondary", bundle: nil)

    // MARK: - Semantic Colors
    struct Carebase {
        // Background hierarchy - subtle depth through color
        static let background = Color(light: .white, dark: Color(hex: "1C1C1E"))
        static let backgroundSecondary = Color(light: Color(hex: "F5F5F7"), dark: Color(hex: "2C2C2E"))
        static let backgroundTertiary = Color(light: Color(hex: "EFEFF4"), dark: Color(hex: "3A3A3C"))

        // Surface colors - for cards and elevated elements
        static let surface = Color(light: .white, dark: Color(hex: "2C2C2E"))
        static let surfaceElevated = Color(light: .white, dark: Color(hex: "3A3A3C"))

        // Text hierarchy - clear visual distinction
        static let textPrimary = Color(light: Color(hex: "1D1D1F"), dark: .white)
        static let textSecondary = Color(light: Color(hex: "6E6E73"), dark: Color(hex: "98989D"))
        static let textTertiary = Color(light: Color(hex: "AEAEB2"), dark: Color(hex: "636366"))

        // Accent colors - purposeful and meaningful
        static let accent = Color(hex: "007AFF")
        static let accentSoft = Color(hex: "007AFF").opacity(0.12)

        // Status colors - gentle but clear
        static let success = Color(hex: "34C759")
        static let successSoft = Color(hex: "34C759").opacity(0.12)
        static let warning = Color(hex: "FF9500")
        static let warningSoft = Color(hex: "FF9500").opacity(0.12)
        static let error = Color(hex: "FF3B30")
        static let errorSoft = Color(hex: "FF3B30").opacity(0.12)
        static let info = Color(hex: "5856D6")
        static let infoSoft = Color(hex: "5856D6").opacity(0.12)

        // Shift status colors
        static let shiftScheduled = Color(hex: "007AFF")
        static let shiftInProgress = Color(hex: "34C759")
        static let shiftCompleted = Color(hex: "8E8E93")
        static let shiftCancelled = Color(hex: "FF3B30")

        // Dividers and borders - barely there
        static let divider = Color(light: Color(hex: "E5E5EA"), dark: Color(hex: "38383A"))
        static let border = Color(light: Color(hex: "D1D1D6"), dark: Color(hex: "48484A"))
    }
}

// MARK: - Hex Color Extension
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }

    init(light: Color, dark: Color) {
        self.init(uiColor: UIColor { traitCollection in
            traitCollection.userInterfaceStyle == .dark
                ? UIColor(dark)
                : UIColor(light)
        })
    }
}
