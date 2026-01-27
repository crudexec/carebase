import SwiftUI

// MARK: - Status Badge
// Clear, at-a-glance status indicators
// Soft backgrounds with bold text for accessibility

struct StatusBadge: View {
    let text: String
    let color: Color
    let icon: String?
    let size: Size

    enum Size {
        case small, medium, large

        var fontSize: Font {
            switch self {
            case .small: return .Carebase.labelSmall
            case .medium: return .Carebase.labelMedium
            case .large: return .Carebase.labelLarge
            }
        }

        var verticalPadding: CGFloat {
            switch self {
            case .small: return 4
            case .medium: return 6
            case .large: return 8
            }
        }

        var horizontalPadding: CGFloat {
            switch self {
            case .small: return 8
            case .medium: return 12
            case .large: return 16
            }
        }

        var iconSize: CGFloat {
            switch self {
            case .small: return 10
            case .medium: return 12
            case .large: return 14
            }
        }
    }

    init(
        _ text: String,
        color: Color = Color.Carebase.accent,
        icon: String? = nil,
        size: Size = .medium
    ) {
        self.text = text
        self.color = color
        self.icon = icon
        self.size = size
    }

    var body: some View {
        HStack(spacing: 4) {
            if let icon = icon {
                Image(systemName: icon)
                    .font(.system(size: size.iconSize, weight: .semibold))
            }
            Text(text)
                .font(size.fontSize)
                .fontWeight(.semibold)
                .lineLimit(1)
                .fixedSize(horizontal: true, vertical: false)
        }
        .foregroundColor(color)
        .padding(.vertical, size.verticalPadding)
        .padding(.horizontal, size.horizontalPadding)
        .background(color.opacity(0.12))
        .cornerRadius(CornerRadius.full)
        .fixedSize()
    }
}

// MARK: - Shift Status Badge
extension StatusBadge {
    enum ShiftStatus: String {
        case scheduled = "Scheduled"
        case inProgress = "In Progress"
        case completed = "Completed"
        case cancelled = "Cancelled"

        var color: Color {
            switch self {
            case .scheduled: return Color.Carebase.shiftScheduled
            case .inProgress: return Color.Carebase.shiftInProgress
            case .completed: return Color.Carebase.shiftCompleted
            case .cancelled: return Color.Carebase.shiftCancelled
            }
        }

        var icon: String {
            switch self {
            case .scheduled: return "calendar"
            case .inProgress: return "clock.fill"
            case .completed: return "checkmark.circle.fill"
            case .cancelled: return "xmark.circle.fill"
            }
        }
    }

    static func shiftStatus(_ status: ShiftStatus, size: Size = .medium) -> StatusBadge {
        StatusBadge(status.rawValue, color: status.color, icon: status.icon, size: size)
    }
}

// MARK: - Dot Indicator
struct DotIndicator: View {
    let color: Color
    let size: CGFloat
    let isPulsing: Bool

    init(color: Color = Color.Carebase.success, size: CGFloat = 8, isPulsing: Bool = false) {
        self.color = color
        self.size = size
        self.isPulsing = isPulsing
    }

    @State private var isAnimating = false

    var body: some View {
        Circle()
            .fill(color)
            .frame(width: size, height: size)
            .overlay(
                Circle()
                    .stroke(color.opacity(0.3), lineWidth: isPulsing && isAnimating ? 4 : 0)
                    .scaleEffect(isAnimating ? 2 : 1)
            )
            .onAppear {
                if isPulsing {
                    withAnimation(.easeInOut(duration: 1).repeatForever(autoreverses: true)) {
                        isAnimating = true
                    }
                }
            }
    }
}

#Preview {
    VStack(spacing: 16) {
        HStack(spacing: 12) {
            StatusBadge.shiftStatus(.scheduled)
            StatusBadge.shiftStatus(.inProgress)
        }

        HStack(spacing: 12) {
            StatusBadge.shiftStatus(.completed)
            StatusBadge.shiftStatus(.cancelled)
        }

        HStack(spacing: 12) {
            StatusBadge("Active", color: Color.Carebase.success, size: .small)
            StatusBadge("Pending", color: Color.Carebase.warning, size: .small)
            StatusBadge("Urgent", color: Color.Carebase.error, size: .small)
        }

        HStack(spacing: 20) {
            HStack(spacing: 8) {
                DotIndicator(color: Color.Carebase.success)
                Text("Online")
            }
            HStack(spacing: 8) {
                DotIndicator(color: Color.Carebase.success, isPulsing: true)
                Text("Live")
            }
        }
        .font(.Carebase.bodyMedium)
    }
    .padding()
}
