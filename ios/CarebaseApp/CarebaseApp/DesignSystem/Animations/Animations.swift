import SwiftUI

// MARK: - Animation Tokens
// Smooth, purposeful animations that feel natural
// Nothing jarring - every animation has meaning

extension Animation {
    struct Carebase {
        // Quick, snappy interactions
        static let quick = Animation.easeOut(duration: 0.15)

        // Standard transitions
        static let standard = Animation.easeInOut(duration: 0.25)

        // Emphasized movements
        static let emphasized = Animation.spring(response: 0.4, dampingFraction: 0.75)

        // Gentle, slow transitions
        static let gentle = Animation.easeInOut(duration: 0.4)

        // Spring animations
        static let bouncy = Animation.spring(response: 0.5, dampingFraction: 0.65)
        static let smooth = Animation.spring(response: 0.6, dampingFraction: 0.85)
    }
}

// MARK: - Transition Styles
extension AnyTransition {
    static let slideUp = AnyTransition.asymmetric(
        insertion: .move(edge: .bottom).combined(with: .opacity),
        removal: .move(edge: .bottom).combined(with: .opacity)
    )

    static let fadeScale = AnyTransition.asymmetric(
        insertion: .scale(scale: 0.95).combined(with: .opacity),
        removal: .scale(scale: 0.95).combined(with: .opacity)
    )

    static let slideFromTrailing = AnyTransition.asymmetric(
        insertion: .move(edge: .trailing).combined(with: .opacity),
        removal: .move(edge: .leading).combined(with: .opacity)
    )
}

// MARK: - Loading Shimmer
struct ShimmerModifier: ViewModifier {
    @State private var phase: CGFloat = 0

    func body(content: Content) -> some View {
        content
            .overlay(
                GeometryReader { geometry in
                    LinearGradient(
                        gradient: Gradient(stops: [
                            .init(color: .clear, location: 0),
                            .init(color: Color.white.opacity(0.4), location: 0.5),
                            .init(color: .clear, location: 1)
                        ]),
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                    .frame(width: geometry.size.width * 2)
                    .offset(x: -geometry.size.width + phase * geometry.size.width * 2)
                }
            )
            .mask(content)
            .onAppear {
                withAnimation(.linear(duration: 1.5).repeatForever(autoreverses: false)) {
                    phase = 1
                }
            }
    }
}

extension View {
    func shimmer() -> some View {
        modifier(ShimmerModifier())
    }
}

// MARK: - Skeleton Loading
struct SkeletonView: View {
    var height: CGFloat = 16
    var cornerRadius: CGFloat = CornerRadius.sm

    var body: some View {
        RoundedRectangle(cornerRadius: cornerRadius)
            .fill(Color.Carebase.backgroundTertiary)
            .frame(height: height)
            .shimmer()
    }
}

struct SkeletonCard: View {
    var body: some View {
        CarebaseCard {
            VStack(alignment: .leading, spacing: Spacing.md) {
                HStack(spacing: Spacing.md) {
                    Circle()
                        .fill(Color.Carebase.backgroundTertiary)
                        .frame(width: 48, height: 48)
                        .shimmer()

                    VStack(alignment: .leading, spacing: Spacing.xs) {
                        SkeletonView(height: 18)
                            .frame(width: 150)
                        SkeletonView(height: 14)
                            .frame(width: 100)
                    }
                }

                SkeletonView(height: 14)
                SkeletonView(height: 14)
                    .frame(width: 200)
            }
        }
    }
}

// MARK: - Haptic Feedback
enum HapticType {
    case light
    case medium
    case heavy
    case success
    case warning
    case error
    case selection

    func trigger() {
        switch self {
        case .light:
            UIImpactFeedbackGenerator(style: .light).impactOccurred()
        case .medium:
            UIImpactFeedbackGenerator(style: .medium).impactOccurred()
        case .heavy:
            UIImpactFeedbackGenerator(style: .heavy).impactOccurred()
        case .success:
            UINotificationFeedbackGenerator().notificationOccurred(.success)
        case .warning:
            UINotificationFeedbackGenerator().notificationOccurred(.warning)
        case .error:
            UINotificationFeedbackGenerator().notificationOccurred(.error)
        case .selection:
            UISelectionFeedbackGenerator().selectionChanged()
        }
    }
}

#Preview {
    VStack(spacing: 20) {
        SkeletonCard()
        SkeletonCard()

        HStack {
            SkeletonView(height: 40, cornerRadius: CornerRadius.lg)
            SkeletonView(height: 40, cornerRadius: CornerRadius.lg)
        }
    }
    .padding()
}
