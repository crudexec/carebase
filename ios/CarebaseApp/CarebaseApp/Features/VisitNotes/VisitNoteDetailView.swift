import SwiftUI

// MARK: - Visit Note Detail View
// Shows the full details of a submitted visit note

struct VisitNoteDetailView: View {
    let noteId: String
    @StateObject private var viewModel = VisitNoteDetailViewModel()
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ScrollView {
            if let note = viewModel.visitNote {
                VStack(spacing: Spacing.lg) {
                    // Header
                    NoteHeaderSection(note: note)

                    // Form Data
                    if let schema = note.formSchemaSnapshot,
                       let sections = schema.sections,
                       let data = note.data {
                        ForEach(sections, id: \.id) { section in
                            FormSectionView(section: section, data: data)
                        }
                    }
                }
                .padding(.vertical, Spacing.lg)
            } else if viewModel.isLoading {
                LoadingView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if let error = viewModel.error {
                ErrorStateView(message: error) {
                    Task { await viewModel.loadNote(id: noteId) }
                }
            }
        }
        .background(Color.Carebase.backgroundSecondary)
        .navigationTitle("Visit Note")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await viewModel.loadNote(id: noteId)
        }
    }
}

// MARK: - Note Header Section
struct NoteHeaderSection: View {
    let note: VisitNote

    var body: some View {
        CarebaseCard {
            VStack(alignment: .leading, spacing: Spacing.md) {
                HStack(spacing: Spacing.md) {
                    Image(systemName: "doc.text.fill")
                        .font(.system(size: 24, weight: .semibold))
                        .foregroundColor(Color.Carebase.accent)
                        .frame(width: 48, height: 48)
                        .background(Color.Carebase.accentSoft)
                        .clipShape(Circle())

                    VStack(alignment: .leading, spacing: Spacing.xxs) {
                        Text(note.templateName)
                            .font(.Carebase.headlineMedium)
                            .foregroundColor(Color.Carebase.textPrimary)

                        if let version = note.templateVersion {
                            Text("Version \(version)")
                                .font(.Carebase.bodySmall)
                                .foregroundColor(Color.Carebase.textTertiary)
                        }
                    }

                    Spacer()
                }

                Divider()

                // Metadata
                VStack(spacing: Spacing.sm) {
                    MetadataRow(icon: "clock", label: "Submitted", value: note.submittedAtFormatted)

                    if let client = note.client {
                        MetadataRow(icon: "person", label: "Client", value: client.fullName)
                    }

                    if let carer = note.carer {
                        MetadataRow(icon: "person.fill", label: "Carer", value: carer.fullName)
                    }

                    if let submittedBy = note.submittedBy, submittedBy.id != note.carer?.id {
                        MetadataRow(icon: "pencil", label: "Submitted by", value: submittedBy.fullName)
                    }
                }
            }
        }
        .screenPadding()
    }
}

// MARK: - Metadata Row
struct MetadataRow: View {
    let icon: String
    let label: String
    let value: String

    var body: some View {
        HStack(spacing: Spacing.sm) {
            Image(systemName: icon)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(Color.Carebase.textTertiary)
                .frame(width: 20)

            Text(label)
                .font(.Carebase.bodySmall)
                .foregroundColor(Color.Carebase.textSecondary)

            Spacer()

            Text(value)
                .font(.Carebase.bodySmall)
                .foregroundColor(Color.Carebase.textPrimary)
        }
    }
}

// MARK: - Form Section View
struct FormSectionView: View {
    let section: FormSection
    let data: [String: AnyCodable]

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            Text(section.title)
                .font(.Carebase.labelMedium)
                .foregroundColor(Color.Carebase.textSecondary)
                .screenPadding()

            CarebaseCard {
                VStack(alignment: .leading, spacing: Spacing.md) {
                    ForEach(section.fields, id: \.id) { field in
                        FieldValueView(field: field, value: data[field.id])

                        if field.id != section.fields.last?.id {
                            Divider()
                        }
                    }
                }
            }
            .screenPadding()
        }
    }
}

// MARK: - Field Value View
struct FieldValueView: View {
    let field: FormField
    let value: AnyCodable?

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            Text(field.label)
                .font(.Carebase.labelSmall)
                .foregroundColor(Color.Carebase.textSecondary)

            displayValue
        }
    }

    @ViewBuilder
    private var displayValue: some View {
        if let value = value?.value {
            switch field.type {
            case .textShort, .textLong:
                if let text = value as? String, !text.isEmpty {
                    Text(text)
                        .font(.Carebase.bodyMedium)
                        .foregroundColor(Color.Carebase.textPrimary)
                } else {
                    emptyValue
                }

            case .number:
                if let number = value as? Double {
                    Text(String(format: "%.0f", number))
                        .font(.Carebase.bodyMedium)
                        .foregroundColor(Color.Carebase.textPrimary)
                } else if let number = value as? Int {
                    Text("\(number)")
                        .font(.Carebase.bodyMedium)
                        .foregroundColor(Color.Carebase.textPrimary)
                } else {
                    emptyValue
                }

            case .yesNo:
                if let bool = value as? Bool {
                    HStack(spacing: Spacing.xs) {
                        Image(systemName: bool ? "checkmark.circle.fill" : "xmark.circle.fill")
                            .foregroundColor(bool ? Color.Carebase.success : Color.Carebase.error)
                        Text(bool ? "Yes" : "No")
                            .font(.Carebase.bodyMedium)
                            .foregroundColor(Color.Carebase.textPrimary)
                    }
                } else {
                    emptyValue
                }

            case .singleChoice:
                if let choice = value as? String, !choice.isEmpty {
                    Text(choice)
                        .font(.Carebase.bodyMedium)
                        .foregroundColor(Color.Carebase.textPrimary)
                        .padding(.horizontal, Spacing.sm)
                        .padding(.vertical, Spacing.xs)
                        .background(Color.Carebase.accentSoft)
                        .cornerRadius(CornerRadius.sm)
                } else {
                    emptyValue
                }

            case .multipleChoice:
                if let choices = value as? [String], !choices.isEmpty {
                    FlowLayout(spacing: Spacing.xs) {
                        ForEach(choices, id: \.self) { choice in
                            Text(choice)
                                .font(.Carebase.bodySmall)
                                .foregroundColor(Color.Carebase.textPrimary)
                                .padding(.horizontal, Spacing.sm)
                                .padding(.vertical, Spacing.xs)
                                .background(Color.Carebase.accentSoft)
                                .cornerRadius(CornerRadius.sm)
                        }
                    }
                } else {
                    emptyValue
                }

            case .date, .time, .dateTime:
                if let dateString = value as? String, !dateString.isEmpty {
                    Text(formatDateValue(dateString, type: field.type))
                        .font(.Carebase.bodyMedium)
                        .foregroundColor(Color.Carebase.textPrimary)
                } else {
                    emptyValue
                }

            case .ratingScale:
                if let rating = value as? Int {
                    let maxRating = field.config?.max ?? field.config?.maxValue ?? 5
                    RatingDisplayView(rating: rating, maxRating: maxRating)
                } else if let rating = value as? Double {
                    let maxRating = field.config?.max ?? field.config?.maxValue ?? 5
                    RatingDisplayView(rating: Int(rating), maxRating: maxRating)
                } else {
                    emptyValue
                }

            case .signature, .photo:
                if let dict = value as? [String: Any], let fileUrl = dict["fileUrl"] as? String {
                    AsyncImage(url: URL(string: fileUrl)) { phase in
                        switch phase {
                        case .success(let image):
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .frame(maxHeight: 200)
                                .cornerRadius(CornerRadius.md)
                        case .failure:
                            Image(systemName: field.type == .signature ? "signature" : "photo")
                                .font(.system(size: 40))
                                .foregroundColor(Color.Carebase.textTertiary)
                        case .empty:
                            ProgressView()
                        @unknown default:
                            EmptyView()
                        }
                    }
                } else {
                    emptyValue
                }
            }
        } else {
            emptyValue
        }
    }

    private var emptyValue: some View {
        Text("Not provided")
            .font(.Carebase.bodyMedium)
            .foregroundColor(Color.Carebase.textTertiary)
            .italic()
    }

    private func formatDateValue(_ dateString: String, type: FormFieldType) -> String {
        let isoFormatter = ISO8601DateFormatter()
        isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        // Try different parsing strategies
        var date: Date?
        date = isoFormatter.date(from: dateString)

        if date == nil {
            isoFormatter.formatOptions = [.withInternetDateTime]
            date = isoFormatter.date(from: dateString)
        }

        if date == nil {
            let fallbackFormatter = DateFormatter()
            fallbackFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
            date = fallbackFormatter.date(from: dateString)
        }

        guard let parsedDate = date else { return dateString }

        let displayFormatter = DateFormatter()
        switch type {
        case .date:
            displayFormatter.dateStyle = .medium
            displayFormatter.timeStyle = .none
        case .time:
            displayFormatter.dateStyle = .none
            displayFormatter.timeStyle = .short
        case .dateTime:
            displayFormatter.dateStyle = .medium
            displayFormatter.timeStyle = .short
        default:
            displayFormatter.dateStyle = .medium
            displayFormatter.timeStyle = .short
        }

        return displayFormatter.string(from: parsedDate)
    }
}

// MARK: - Rating Display View
struct RatingDisplayView: View {
    let rating: Int
    let maxRating: Int

    var body: some View {
        HStack(spacing: Spacing.xxs) {
            ForEach(1...maxRating, id: \.self) { index in
                Image(systemName: index <= rating ? "star.fill" : "star")
                    .foregroundColor(index <= rating ? Color.Carebase.warning : Color.Carebase.textTertiary)
                    .font(.system(size: 18))
            }
            Text("\(rating)/\(maxRating)")
                .font(.Carebase.bodySmall)
                .foregroundColor(Color.Carebase.textSecondary)
                .padding(.leading, Spacing.xs)
        }
    }
}

// MARK: - Flow Layout
struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let maxWidth = proposal.width ?? .infinity
        var height: CGFloat = 0
        var rowWidth: CGFloat = 0
        var rowHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if rowWidth + size.width > maxWidth {
                height += rowHeight + spacing
                rowWidth = size.width + spacing
                rowHeight = size.height
            } else {
                rowWidth += size.width + spacing
                rowHeight = max(rowHeight, size.height)
            }
        }
        height += rowHeight

        return CGSize(width: maxWidth, height: height)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var x = bounds.minX
        var y = bounds.minY
        var rowHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > bounds.maxX {
                x = bounds.minX
                y += rowHeight + spacing
                rowHeight = 0
            }
            subview.place(at: CGPoint(x: x, y: y), proposal: .unspecified)
            x += size.width + spacing
            rowHeight = max(rowHeight, size.height)
        }
    }
}

// MARK: - View Model
@MainActor
class VisitNoteDetailViewModel: ObservableObject {
    @Published var visitNote: VisitNote?
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIClient.shared

    func loadNote(id: String) async {
        isLoading = true
        error = nil

        do {
            let response: VisitNoteResponse = try await api.request(endpoint: .visitNote(id: id))
            self.visitNote = response.visitNote
        } catch let apiError as APIError {
            self.error = apiError.errorDescription
            #if DEBUG
            print("Error loading visit note: \(apiError)")
            #endif
        } catch {
            self.error = "Failed to load visit note"
            #if DEBUG
            print("Error loading visit note: \(error)")
            #endif
        }

        isLoading = false
    }
}

#Preview {
    NavigationStack {
        VisitNoteDetailView(noteId: "1")
    }
}
