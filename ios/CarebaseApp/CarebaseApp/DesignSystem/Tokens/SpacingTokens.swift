import SwiftUI

// MARK: - Spacing System
// Generous whitespace for clarity and breathing room
// Based on an 8pt grid system

struct Spacing {
    // Base unit
    static let unit: CGFloat = 8

    // Named spacing values
    static let xxs: CGFloat = 4      // Tight spacing
    static let xs: CGFloat = 8       // Minimum spacing
    static let sm: CGFloat = 12      // Small spacing
    static let md: CGFloat = 16      // Medium spacing
    static let lg: CGFloat = 24      // Large spacing
    static let xl: CGFloat = 32      // Extra large
    static let xxl: CGFloat = 48     // Section spacing
    static let xxxl: CGFloat = 64    // Major section spacing

    // Screen edge insets
    static let screenHorizontal: CGFloat = 20
    static let screenVertical: CGFloat = 16

    // Card padding
    static let cardPadding: CGFloat = 20
    static let cardSpacing: CGFloat = 12
}

// MARK: - Corner Radius
struct CornerRadius {
    static let xs: CGFloat = 4
    static let sm: CGFloat = 8
    static let md: CGFloat = 12
    static let lg: CGFloat = 16
    static let xl: CGFloat = 20
    static let xxl: CGFloat = 28
    static let full: CGFloat = 9999  // Pill shape
}

// MARK: - Shadow Styles
struct ShadowStyle {
    let color: Color
    let radius: CGFloat
    let x: CGFloat
    let y: CGFloat

    // Subtle, almost imperceptible shadows
    static let subtle = ShadowStyle(
        color: Color.black.opacity(0.04),
        radius: 8,
        x: 0,
        y: 2
    )

    // Slightly more prominent for elevated cards
    static let card = ShadowStyle(
        color: Color.black.opacity(0.06),
        radius: 16,
        x: 0,
        y: 4
    )

    // For floating elements like FABs
    static let elevated = ShadowStyle(
        color: Color.black.opacity(0.12),
        radius: 24,
        x: 0,
        y: 8
    )
}

// MARK: - Shadow Modifier
extension View {
    func carebaseShadow(_ style: ShadowStyle) -> some View {
        self.shadow(
            color: style.color,
            radius: style.radius,
            x: style.x,
            y: style.y
        )
    }
}

// MARK: - Safe Area Extension
extension View {
    func screenPadding() -> some View {
        self.padding(.horizontal, Spacing.screenHorizontal)
    }
}
