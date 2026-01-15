import SwiftUI

// MARK: - Card Component
// Clean, minimal cards with subtle elevation
// Content-first design - the card disappears, content shines

struct CarebaseCard<Content: View>: View {
    let content: Content
    var padding: CGFloat
    var backgroundColor: Color
    var cornerRadius: CGFloat
    var hasShadow: Bool

    init(
        padding: CGFloat = Spacing.cardPadding,
        backgroundColor: Color = Color.Carebase.surface,
        cornerRadius: CGFloat = CornerRadius.xl,
        hasShadow: Bool = true,
        @ViewBuilder content: () -> Content
    ) {
        self.content = content()
        self.padding = padding
        self.backgroundColor = backgroundColor
        self.cornerRadius = cornerRadius
        self.hasShadow = hasShadow
    }

    var body: some View {
        content
            .padding(padding)
            .background(backgroundColor)
            .cornerRadius(cornerRadius)
            .if(hasShadow) { view in
                view.carebaseShadow(.card)
            }
    }
}

// MARK: - Tappable Card
struct TappableCard<Content: View>: View {
    let content: Content
    let action: () -> Void

    init(action: @escaping () -> Void, @ViewBuilder content: () -> Content) {
        self.content = content()
        self.action = action
    }

    var body: some View {
        Button(action: {
            let impactLight = UIImpactFeedbackGenerator(style: .light)
            impactLight.impactOccurred()
            action()
        }) {
            CarebaseCard {
                content
            }
        }
        .buttonStyle(CardButtonStyle())
    }
}

struct CardButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
            .opacity(configuration.isPressed ? 0.9 : 1)
            .animation(.easeInOut(duration: 0.15), value: configuration.isPressed)
    }
}

// MARK: - Info Card
struct InfoCard: View {
    let icon: String
    let title: String
    let value: String
    let color: Color
    let trend: String?

    init(
        icon: String,
        title: String,
        value: String,
        color: Color = Color.Carebase.accent,
        trend: String? = nil
    ) {
        self.icon = icon
        self.title = title
        self.value = value
        self.color = color
        self.trend = trend
    }

    var body: some View {
        CarebaseCard {
            VStack(alignment: .leading, spacing: Spacing.sm) {
                HStack {
                    Image(systemName: icon)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(color)
                        .frame(width: 36, height: 36)
                        .background(color.opacity(0.12))
                        .clipShape(Circle())

                    Spacer()

                    if let trend = trend {
                        Text(trend)
                            .font(.Carebase.caption)
                            .foregroundColor(Color.Carebase.success)
                    }
                }

                VStack(alignment: .leading, spacing: Spacing.xxs) {
                    Text(value)
                        .font(.Carebase.displaySmall)
                        .foregroundColor(Color.Carebase.textPrimary)

                    Text(title)
                        .font(.Carebase.bodySmall)
                        .foregroundColor(Color.Carebase.textSecondary)
                }
            }
        }
    }
}

// MARK: - Conditional Modifier
extension View {
    @ViewBuilder
    func `if`<Transform: View>(_ condition: Bool, transform: (Self) -> Transform) -> some View {
        if condition {
            transform(self)
        } else {
            self
        }
    }
}

#Preview {
    VStack(spacing: 16) {
        CarebaseCard {
            VStack(alignment: .leading) {
                Text("Simple Card")
                    .font(.Carebase.headlineMedium)
                Text("This is a basic card with content")
                    .font(.Carebase.bodyMedium)
                    .foregroundColor(Color.Carebase.textSecondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }

        HStack(spacing: 12) {
            InfoCard(
                icon: "clock.fill",
                title: "Hours Today",
                value: "6.5",
                color: Color.Carebase.accent
            )
            InfoCard(
                icon: "checkmark.circle.fill",
                title: "Shifts Done",
                value: "3",
                color: Color.Carebase.success
            )
        }
    }
    .padding()
    .background(Color.Carebase.backgroundSecondary)
}
