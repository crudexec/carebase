import SwiftUI

// MARK: - List Row
// Clean, scannable list items with clear hierarchy
// Optimized for quick comprehension

struct ListRow<Leading: View, Trailing: View>: View {
    let title: String
    let subtitle: String?
    let leading: Leading?
    let trailing: Trailing?
    let showChevron: Bool
    let action: (() -> Void)?

    init(
        title: String,
        subtitle: String? = nil,
        @ViewBuilder leading: () -> Leading = { EmptyView() as! Leading },
        @ViewBuilder trailing: () -> Trailing = { EmptyView() as! Trailing },
        showChevron: Bool = true,
        action: (() -> Void)? = nil
    ) {
        self.title = title
        self.subtitle = subtitle
        self.leading = leading()
        self.trailing = trailing()
        self.showChevron = showChevron
        self.action = action
    }

    var body: some View {
        Button(action: {
            if let action = action {
                let impactLight = UIImpactFeedbackGenerator(style: .light)
                impactLight.impactOccurred()
                action()
            }
        }) {
            HStack(spacing: Spacing.md) {
                if let leading = leading, !(leading is EmptyView) {
                    leading
                }

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

                if let trailing = trailing, !(trailing is EmptyView) {
                    trailing
                }

                if showChevron && action != nil {
                    Image(systemName: "chevron.right")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(Color.Carebase.textTertiary)
                }
            }
            .padding(.vertical, Spacing.md)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .disabled(action == nil)
    }
}

// MARK: - Shift List Row
struct ShiftListRow: View {
    let clientName: String
    let timeRange: String
    let location: String
    let status: StatusBadge.ShiftStatus
    let action: () -> Void

    var body: some View {
        TappableCard(action: action) {
            HStack(spacing: Spacing.md) {
                // Time indicator
                VStack(spacing: Spacing.xxs) {
                    Text(startTime)
                        .font(.Carebase.headlineSmall)
                        .foregroundColor(Color.Carebase.textPrimary)
                    Text(endTime)
                        .font(.Carebase.bodySmall)
                        .foregroundColor(Color.Carebase.textTertiary)
                }
                .frame(width: 50)

                // Divider line
                RoundedRectangle(cornerRadius: 2)
                    .fill(status.color)
                    .frame(width: 3)

                // Shift details
                VStack(alignment: .leading, spacing: Spacing.xs) {
                    Text(clientName)
                        .font(.Carebase.headlineSmall)
                        .foregroundColor(Color.Carebase.textPrimary)

                    HStack(spacing: Spacing.xs) {
                        Image(systemName: "mappin")
                            .font(.system(size: 12))
                        Text(location)
                            .font(.Carebase.bodySmall)
                    }
                    .foregroundColor(Color.Carebase.textSecondary)
                }

                Spacer()

                // Status
                StatusBadge.shiftStatus(status, size: .small)
            }
        }
    }

    private var startTime: String {
        // Extract start time from timeRange (e.g., "9:00 AM - 12:00 PM" -> "9:00")
        let components = timeRange.components(separatedBy: " - ")
        return components.first?.replacingOccurrences(of: " AM", with: "").replacingOccurrences(of: " PM", with: "") ?? ""
    }

    private var endTime: String {
        let components = timeRange.components(separatedBy: " - ")
        return components.last?.replacingOccurrences(of: " AM", with: "").replacingOccurrences(of: " PM", with: "") ?? ""
    }
}

// MARK: - Avatar
struct Avatar: View {
    let name: String
    let imageURL: String?
    let size: CGFloat
    let backgroundColor: Color

    init(
        name: String,
        imageURL: String? = nil,
        size: CGFloat = 48,
        backgroundColor: Color = Color.Carebase.accentSoft
    ) {
        self.name = name
        self.imageURL = imageURL
        self.size = size
        self.backgroundColor = backgroundColor
    }

    var body: some View {
        Group {
            if let imageURL = imageURL, let url = URL(string: imageURL) {
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    default:
                        initialsView
                    }
                }
            } else {
                initialsView
            }
        }
        .frame(width: size, height: size)
        .clipShape(Circle())
    }

    private var initialsView: some View {
        Text(initials)
            .font(.system(size: size * 0.4, weight: .semibold, design: .rounded))
            .foregroundColor(Color.Carebase.accent)
            .frame(width: size, height: size)
            .background(backgroundColor)
    }

    private var initials: String {
        let components = name.components(separatedBy: " ")
        let firstInitial = components.first?.prefix(1) ?? ""
        let lastInitial = components.count > 1 ? components.last?.prefix(1) ?? "" : ""
        return "\(firstInitial)\(lastInitial)".uppercased()
    }
}

#Preview("List Rows") {
    ScrollView {
        VStack(spacing: 12) {
            ShiftListRow(
                clientName: "Margaret Thompson",
                timeRange: "9:00 AM - 12:00 PM",
                location: "123 Oak Street",
                status: .scheduled
            ) {}

            ShiftListRow(
                clientName: "Robert Williams",
                timeRange: "2:00 PM - 6:00 PM",
                location: "456 Elm Avenue",
                status: .inProgress
            ) {}
        }
        .padding()
    }
}
