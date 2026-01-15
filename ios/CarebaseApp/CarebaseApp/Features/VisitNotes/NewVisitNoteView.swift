import SwiftUI

// MARK: - New Visit Note View
// Dynamic form rendering for visit notes
// Clean, step-by-step form completion

struct NewVisitNoteView: View {
    let shiftId: String
    let clientId: String
    let preselectedTemplate: FormTemplate?

    @StateObject private var viewModel = NewVisitNoteViewModel()
    @Environment(\.dismiss) private var dismiss

    init(shiftId: String, clientId: String = "", template: FormTemplate? = nil) {
        self.shiftId = shiftId
        self.clientId = clientId
        self.preselectedTemplate = template
    }

    var body: some View {
        NavigationStack {
            FormView(viewModel: viewModel)
                .background(Color.Carebase.backgroundSecondary)
                .navigationTitle(viewModel.selectedTemplate?.name ?? "Visit Note")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .navigationBarLeading) {
                        Button("Cancel") {
                            dismiss()
                        }
                    }

                    ToolbarItem(placement: .navigationBarTrailing) {
                        Button("Submit") {
                            Task { await viewModel.submit() }
                        }
                        .fontWeight(.semibold)
                        .disabled(!viewModel.canSubmit || viewModel.isLoading)
                    }
                }
        }
        .task {
            viewModel.shiftId = shiftId
            viewModel.clientId = clientId
            if let template = preselectedTemplate {
                viewModel.selectTemplate(template)
            }
        }
        .onChange(of: viewModel.isSubmitted) { _, isSubmitted in
            if isSubmitted {
                HapticType.success.trigger()
                dismiss()
            }
        }
        .alert("Error", isPresented: Binding(
            get: { viewModel.submitError != nil },
            set: { if !$0 { viewModel.submitError = nil } }
        )) {
            Button("OK", role: .cancel) {}
        } message: {
            if let error = viewModel.submitError {
                Text(error)
            }
        }
    }
}

// MARK: - Template Selection Sheet
struct TemplateSelectionSheet: View {
    let templates: [FormTemplate]
    let isLoading: Bool
    let error: String?
    let onSelect: (FormTemplate) -> Void
    let onRetry: () -> Void
    let onCancel: () -> Void

    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Button("Cancel") {
                    onCancel()
                }
                .foregroundColor(Color.Carebase.accent)

                Spacer()

                Text("Select Form")
                    .font(.Carebase.headlineSmall)
                    .foregroundColor(Color.Carebase.textPrimary)

                Spacer()

                // Placeholder for symmetry
                Text("Cancel")
                    .foregroundColor(.clear)
            }
            .padding(.horizontal, Spacing.screenHorizontal)
            .padding(.vertical, Spacing.md)
            .background(Color.Carebase.background)

            Divider()

            ScrollView {
                VStack(alignment: .leading, spacing: Spacing.lg) {
                    Text("Choose a form type for your visit note.")
                        .font(.Carebase.bodyMedium)
                        .foregroundColor(Color.Carebase.textSecondary)

                    if isLoading {
                        VStack(spacing: Spacing.md) {
                            ForEach(0..<3, id: \.self) { _ in
                                SkeletonCard()
                            }
                        }
                    } else if let error = error {
                        // Error state
                        VStack(spacing: Spacing.md) {
                            Image(systemName: "exclamationmark.triangle")
                                .font(.system(size: 48, weight: .light))
                                .foregroundColor(Color.Carebase.warning)

                            Text("Failed to load forms")
                                .font(.Carebase.headlineSmall)
                                .foregroundColor(Color.Carebase.textPrimary)

                            Text(error)
                                .font(.Carebase.bodySmall)
                                .foregroundColor(Color.Carebase.textSecondary)
                                .multilineTextAlignment(.center)

                            Button(action: onRetry) {
                                Text("Try Again")
                                    .font(.Carebase.labelMedium)
                                    .foregroundColor(.white)
                                    .padding(.horizontal, Spacing.lg)
                                    .padding(.vertical, Spacing.sm)
                                    .background(Color.Carebase.accent)
                                    .cornerRadius(CornerRadius.md)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, Spacing.xl)
                    } else if templates.isEmpty {
                        // Empty state
                        VStack(spacing: Spacing.md) {
                            Image(systemName: "doc.text.magnifyingglass")
                                .font(.system(size: 48, weight: .light))
                                .foregroundColor(Color.Carebase.textTertiary)

                            Text("No forms available")
                                .font(.Carebase.headlineSmall)
                                .foregroundColor(Color.Carebase.textPrimary)

                            Text("Your administrator hasn't set up any visit note forms yet.")
                                .font(.Carebase.bodySmall)
                                .foregroundColor(Color.Carebase.textSecondary)
                                .multilineTextAlignment(.center)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, Spacing.xl)
                    } else {
                        VStack(spacing: Spacing.sm) {
                            ForEach(templates) { template in
                                TemplateCard(template: template) {
                                    onSelect(template)
                                }
                            }
                        }
                    }
                }
                .padding(.horizontal, Spacing.screenHorizontal)
                .padding(.vertical, Spacing.md)
            }
        }
        .background(Color.Carebase.backgroundSecondary)
    }
}

// MARK: - Template Selection View
struct TemplateSelectionView: View {
    let templates: [FormTemplate]
    let isLoading: Bool
    let error: String?
    let onSelect: (FormTemplate) -> Void
    let onRetry: () -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Spacing.lg) {
                Text("Select a form")
                    .font(.Carebase.headlineMedium)
                    .foregroundColor(Color.Carebase.textPrimary)

                Text("Choose the type of visit note you want to submit.")
                    .font(.Carebase.bodyMedium)
                    .foregroundColor(Color.Carebase.textSecondary)

                if isLoading {
                    VStack(spacing: Spacing.md) {
                        ForEach(0..<3, id: \.self) { _ in
                            SkeletonCard()
                        }
                    }
                } else if let error = error {
                    // Error state
                    VStack(spacing: Spacing.md) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.system(size: 48, weight: .light))
                            .foregroundColor(Color.Carebase.warning)

                        Text("Failed to load forms")
                            .font(.Carebase.headlineSmall)
                            .foregroundColor(Color.Carebase.textPrimary)

                        Text(error)
                            .font(.Carebase.bodySmall)
                            .foregroundColor(Color.Carebase.textSecondary)
                            .multilineTextAlignment(.center)

                        Button(action: onRetry) {
                            Text("Try Again")
                                .font(.Carebase.labelMedium)
                                .foregroundColor(.white)
                                .padding(.horizontal, Spacing.lg)
                                .padding(.vertical, Spacing.sm)
                                .background(Color.Carebase.accent)
                                .cornerRadius(CornerRadius.md)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, Spacing.xxl)
                } else if templates.isEmpty {
                    // Empty state
                    VStack(spacing: Spacing.md) {
                        Image(systemName: "doc.text.magnifyingglass")
                            .font(.system(size: 48, weight: .light))
                            .foregroundColor(Color.Carebase.textTertiary)

                        Text("No forms available")
                            .font(.Carebase.headlineSmall)
                            .foregroundColor(Color.Carebase.textPrimary)

                        Text("Your administrator hasn't set up any visit note forms yet. Please contact them to create and enable forms.")
                            .font(.Carebase.bodySmall)
                            .foregroundColor(Color.Carebase.textSecondary)
                            .multilineTextAlignment(.center)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, Spacing.xxl)
                } else {
                    VStack(spacing: Spacing.sm) {
                        ForEach(templates) { template in
                            TemplateCard(template: template) {
                                onSelect(template)
                            }
                        }
                    }
                }
            }
            .padding(.horizontal, Spacing.screenHorizontal)
            .padding(.vertical, Spacing.lg)
        }
    }
}

struct TemplateCard: View {
    let template: FormTemplate
    let onTap: () -> Void

    var body: some View {
        Button(action: {
            HapticType.light.trigger()
            onTap()
        }) {
            CarebaseCard {
                HStack(spacing: Spacing.md) {
                    Image(systemName: "doc.text.fill")
                        .font(.system(size: 20, weight: .medium))
                        .foregroundColor(Color.Carebase.accent)
                        .frame(width: 44, height: 44)
                        .background(Color.Carebase.accentSoft)
                        .clipShape(Circle())

                    VStack(alignment: .leading, spacing: Spacing.xxs) {
                        Text(template.name)
                            .font(.Carebase.headlineSmall)
                            .foregroundColor(Color.Carebase.textPrimary)

                        if let description = template.description {
                            Text(description)
                                .font(.Carebase.bodySmall)
                                .foregroundColor(Color.Carebase.textSecondary)
                                .lineLimit(2)
                        }

                        Text("\(template.sections?.count ?? 0) sections")
                            .font(.Carebase.caption)
                            .foregroundColor(Color.Carebase.textTertiary)
                    }

                    Spacer()

                    Image(systemName: "chevron.right")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(Color.Carebase.textTertiary)
                }
            }
        }
        .buttonStyle(ScaleButtonStyle())
    }
}

// MARK: - Form View
struct FormView: View {
    @ObservedObject var viewModel: NewVisitNoteViewModel

    var body: some View {
        ScrollView {
            VStack(spacing: Spacing.xl) {
                if let template = viewModel.selectedTemplate,
                   let sections = template.sections {
                    ForEach(sections) { section in
                        FormSectionView(
                            section: section,
                            formData: $viewModel.formData
                        )
                    }
                }

                // Progress indicator
                ProgressBar(progress: viewModel.completionProgress)
                    .screenPadding()
            }
            .padding(.vertical, Spacing.lg)
        }
    }
}

// MARK: - Form Section View
struct FormSectionView: View {
    let section: FormSection
    @Binding var formData: [String: Any]

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            // Section Header
            VStack(alignment: .leading, spacing: Spacing.xxs) {
                Text(section.title)
                    .font(.Carebase.headlineSmall)
                    .foregroundColor(Color.Carebase.textPrimary)

                if let description = section.description {
                    Text(description)
                        .font(.Carebase.bodySmall)
                        .foregroundColor(Color.Carebase.textSecondary)
                }
            }
            .screenPadding()

            // Fields
            CarebaseCard {
                VStack(spacing: Spacing.lg) {
                    ForEach(section.fields.sorted(by: { $0.order < $1.order })) { field in
                        FormFieldView(field: field, formData: $formData)

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

// MARK: - Form Field View
struct FormFieldView: View {
    let field: FormField
    @Binding var formData: [String: Any]

    @State private var textValue: String = ""
    @State private var boolValue: Bool = false
    @State private var numberValue: Double = 0
    @State private var selectedOption: String = ""
    @State private var selectedOptions: Set<String> = []
    @State private var dateValue: Date = Date()
    @State private var signatureImage: UIImage?
    @State private var photoImage: UIImage?
    @State private var showingImagePicker = false
    @State private var showingCamera = false

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            // Label
            HStack(spacing: Spacing.xxs) {
                Text(field.label)
                    .font(.Carebase.labelLarge)
                    .foregroundColor(Color.Carebase.textPrimary)

                if field.required {
                    Text("*")
                        .font(.Carebase.labelLarge)
                        .foregroundColor(Color.Carebase.error)
                }
            }

            if let description = field.description {
                Text(description)
                    .font(.Carebase.caption)
                    .foregroundColor(Color.Carebase.textTertiary)
            }

            // Field Input
            Group {
                switch field.type {
                case .textShort:
                    TextField(field.config?.placeholder ?? "", text: $textValue)
                        .textFieldStyle(CarebaseTextFieldStyle())
                        .onChange(of: textValue) { _, value in
                            formData[field.id] = value
                        }

                case .textLong:
                    TextEditor(text: $textValue)
                        .frame(minHeight: 100)
                        .padding(Spacing.sm)
                        .background(Color.Carebase.backgroundSecondary)
                        .cornerRadius(CornerRadius.md)
                        .onChange(of: textValue) { _, value in
                            formData[field.id] = value
                        }

                case .number:
                    HStack {
                        TextField("0", value: $numberValue, format: .number)
                            .keyboardType(.decimalPad)
                            .textFieldStyle(CarebaseTextFieldStyle())

                        Stepper("", value: $numberValue)
                            .labelsHidden()
                    }
                    .onChange(of: numberValue) { _, value in
                        formData[field.id] = value
                    }

                case .yesNo:
                    Toggle(isOn: $boolValue) {
                        Text(boolValue ? "Yes" : "No")
                            .font(.Carebase.bodyMedium)
                    }
                    .tint(Color.Carebase.accent)
                    .onChange(of: boolValue) { _, value in
                        formData[field.id] = value
                    }

                case .singleChoice:
                    SingleChoiceField(
                        options: field.config?.options ?? [],
                        selected: $selectedOption
                    )
                    .onChange(of: selectedOption) { _, value in
                        formData[field.id] = value
                    }

                case .multipleChoice:
                    MultipleChoiceField(
                        options: field.config?.options ?? [],
                        selected: $selectedOptions
                    )
                    .onChange(of: selectedOptions) { _, value in
                        formData[field.id] = Array(value)
                    }

                case .ratingScale:
                    RatingField(
                        maxValue: field.config?.maxValue ?? 5,
                        value: Binding(
                            get: { Int(numberValue) },
                            set: { numberValue = Double($0) }
                        )
                    )
                    .onChange(of: numberValue) { _, value in
                        formData[field.id] = Int(value)
                    }

                case .date:
                    DatePicker(
                        "",
                        selection: $dateValue,
                        displayedComponents: .date
                    )
                    .datePickerStyle(.compact)
                    .labelsHidden()
                    .onChange(of: dateValue) { _, value in
                        let formatter = ISO8601DateFormatter()
                        formData[field.id] = formatter.string(from: value)
                    }

                case .time:
                    DatePicker(
                        "",
                        selection: $dateValue,
                        displayedComponents: .hourAndMinute
                    )
                    .datePickerStyle(.compact)
                    .labelsHidden()
                    .onChange(of: dateValue) { _, value in
                        let formatter = DateFormatter()
                        formatter.dateFormat = "HH:mm"
                        formData[field.id] = formatter.string(from: value)
                    }

                case .dateTime:
                    DatePicker(
                        "",
                        selection: $dateValue,
                        displayedComponents: [.date, .hourAndMinute]
                    )
                    .datePickerStyle(.compact)
                    .labelsHidden()
                    .onChange(of: dateValue) { _, value in
                        let formatter = ISO8601DateFormatter()
                        formData[field.id] = formatter.string(from: value)
                    }

                case .signature:
                    SignatureField(image: $signatureImage)
                        .onChange(of: signatureImage) { _, image in
                            if let image = image,
                               let data = image.pngData() {
                                formData[field.id] = data.base64EncodedString()
                            }
                        }

                case .photo:
                    PhotoField(
                        image: $photoImage,
                        showingImagePicker: $showingImagePicker,
                        showingCamera: $showingCamera
                    )
                    .onChange(of: photoImage) { _, image in
                        if let image = image,
                           let data = image.jpegData(compressionQuality: 0.8) {
                            formData[field.id] = data.base64EncodedString()
                        }
                    }
                }
            }
        }
    }
}

// MARK: - Custom Field Components
struct CarebaseTextFieldStyle: TextFieldStyle {
    func _body(configuration: TextField<Self._Label>) -> some View {
        configuration
            .padding(Spacing.md)
            .background(Color.Carebase.backgroundSecondary)
            .cornerRadius(CornerRadius.md)
    }
}

struct SingleChoiceField: View {
    let options: [FieldOption]
    @Binding var selected: String

    var body: some View {
        VStack(spacing: Spacing.xs) {
            ForEach(options, id: \.value) { option in
                Button(action: { selected = option.value }) {
                    HStack {
                        Text(option.label)
                            .font(.Carebase.bodyMedium)
                            .foregroundColor(Color.Carebase.textPrimary)

                        Spacer()

                        Image(systemName: selected == option.value ? "checkmark.circle.fill" : "circle")
                            .foregroundColor(selected == option.value ? Color.Carebase.accent : Color.Carebase.textTertiary)
                    }
                    .padding(Spacing.sm)
                    .background(selected == option.value ? Color.Carebase.accentSoft : Color.Carebase.backgroundSecondary)
                    .cornerRadius(CornerRadius.sm)
                }
                .buttonStyle(.plain)
            }
        }
    }
}

struct MultipleChoiceField: View {
    let options: [FieldOption]
    @Binding var selected: Set<String>

    var body: some View {
        VStack(spacing: Spacing.xs) {
            ForEach(options, id: \.value) { option in
                Button(action: {
                    if selected.contains(option.value) {
                        selected.remove(option.value)
                    } else {
                        selected.insert(option.value)
                    }
                }) {
                    HStack {
                        Text(option.label)
                            .font(.Carebase.bodyMedium)
                            .foregroundColor(Color.Carebase.textPrimary)

                        Spacer()

                        Image(systemName: selected.contains(option.value) ? "checkmark.square.fill" : "square")
                            .foregroundColor(selected.contains(option.value) ? Color.Carebase.accent : Color.Carebase.textTertiary)
                    }
                    .padding(Spacing.sm)
                    .background(selected.contains(option.value) ? Color.Carebase.accentSoft : Color.Carebase.backgroundSecondary)
                    .cornerRadius(CornerRadius.sm)
                }
                .buttonStyle(.plain)
            }
        }
    }
}

struct RatingField: View {
    let maxValue: Int
    @Binding var value: Int

    var body: some View {
        HStack(spacing: Spacing.xs) {
            ForEach(1...maxValue, id: \.self) { i in
                Button(action: { value = i }) {
                    Image(systemName: i <= value ? "star.fill" : "star")
                        .font(.system(size: 28))
                        .foregroundColor(i <= value ? Color.Carebase.warning : Color.Carebase.textTertiary)
                }
                .buttonStyle(.plain)
            }
        }
    }
}

// MARK: - Signature Field
struct SignatureField: View {
    @Binding var image: UIImage?
    @State private var currentPath = Path()
    @State private var paths: [Path] = []

    var body: some View {
        VStack(spacing: Spacing.sm) {
            ZStack {
                RoundedRectangle(cornerRadius: CornerRadius.md)
                    .fill(Color.white)
                    .overlay(
                        RoundedRectangle(cornerRadius: CornerRadius.md)
                            .stroke(Color.Carebase.border, lineWidth: 1)
                    )

                if image != nil {
                    Image(uiImage: image!)
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .padding(Spacing.sm)
                } else {
                    Canvas { context, size in
                        for path in paths {
                            context.stroke(path, with: .color(Color.Carebase.textPrimary), lineWidth: 2)
                        }
                        context.stroke(currentPath, with: .color(Color.Carebase.textPrimary), lineWidth: 2)
                    }
                    .gesture(
                        DragGesture(minimumDistance: 0)
                            .onChanged { value in
                                let point = value.location
                                if currentPath.isEmpty {
                                    currentPath.move(to: point)
                                } else {
                                    currentPath.addLine(to: point)
                                }
                            }
                            .onEnded { _ in
                                paths.append(currentPath)
                                currentPath = Path()
                            }
                    )

                    if paths.isEmpty {
                        Text("Sign here")
                            .font(.Carebase.bodyMedium)
                            .foregroundColor(Color.Carebase.textTertiary)
                    }
                }
            }
            .frame(height: 150)

            HStack(spacing: Spacing.sm) {
                Button(action: {
                    paths.removeAll()
                    currentPath = Path()
                    image = nil
                }) {
                    HStack {
                        Image(systemName: "trash")
                        Text("Clear")
                    }
                    .font(.Carebase.labelMedium)
                    .foregroundColor(Color.Carebase.error)
                    .padding(.horizontal, Spacing.md)
                    .padding(.vertical, Spacing.sm)
                    .background(Color.Carebase.errorSoft)
                    .cornerRadius(CornerRadius.sm)
                }

                Spacer()

                Button(action: saveSignature) {
                    HStack {
                        Image(systemName: "checkmark")
                        Text("Save")
                    }
                    .font(.Carebase.labelMedium)
                    .foregroundColor(.white)
                    .padding(.horizontal, Spacing.md)
                    .padding(.vertical, Spacing.sm)
                    .background(Color.Carebase.accent)
                    .cornerRadius(CornerRadius.sm)
                }
                .disabled(paths.isEmpty)
            }
        }
    }

    @MainActor
    private func saveSignature() {
        let content = Canvas { context, _ in
            for path in paths {
                context.stroke(path, with: .color(.black), lineWidth: 2)
            }
        }
        .frame(width: 300, height: 150)
        .background(Color.white)

        let renderer = ImageRenderer(content: content)
        renderer.scale = 2.0
        image = renderer.uiImage
    }
}

// MARK: - Photo Field
struct PhotoField: View {
    @Binding var image: UIImage?
    @Binding var showingImagePicker: Bool
    @Binding var showingCamera: Bool

    var body: some View {
        VStack(spacing: Spacing.sm) {
            if let image = image {
                Image(uiImage: image)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .frame(height: 200)
                    .clipShape(RoundedRectangle(cornerRadius: CornerRadius.md))

                Button(action: { self.image = nil }) {
                    HStack {
                        Image(systemName: "trash")
                        Text("Remove Photo")
                    }
                    .font(.Carebase.labelMedium)
                    .foregroundColor(Color.Carebase.error)
                }
            } else {
                HStack(spacing: Spacing.md) {
                    Button(action: { showingCamera = true }) {
                        VStack(spacing: Spacing.xs) {
                            Image(systemName: "camera.fill")
                                .font(.system(size: 24))
                            Text("Camera")
                                .font(.Carebase.labelMedium)
                        }
                        .foregroundColor(Color.Carebase.accent)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, Spacing.lg)
                        .background(Color.Carebase.accentSoft)
                        .cornerRadius(CornerRadius.md)
                    }

                    Button(action: { showingImagePicker = true }) {
                        VStack(spacing: Spacing.xs) {
                            Image(systemName: "photo.fill")
                                .font(.system(size: 24))
                            Text("Gallery")
                                .font(.Carebase.labelMedium)
                        }
                        .foregroundColor(Color.Carebase.accent)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, Spacing.lg)
                        .background(Color.Carebase.accentSoft)
                        .cornerRadius(CornerRadius.md)
                    }
                }
            }
        }
        .sheet(isPresented: $showingImagePicker) {
            ImagePicker(image: $image, sourceType: .photoLibrary)
        }
        .sheet(isPresented: $showingCamera) {
            ImagePicker(image: $image, sourceType: .camera)
        }
    }
}

// MARK: - Image Picker
struct ImagePicker: UIViewControllerRepresentable {
    @Binding var image: UIImage?
    let sourceType: UIImagePickerController.SourceType
    @Environment(\.dismiss) private var dismiss

    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.sourceType = sourceType
        picker.delegate = context.coordinator
        return picker
    }

    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let parent: ImagePicker

        init(_ parent: ImagePicker) {
            self.parent = parent
        }

        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            if let image = info[.originalImage] as? UIImage {
                parent.image = image
            }
            parent.dismiss()
        }

        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            parent.dismiss()
        }
    }
}

struct ProgressBar: View {
    let progress: Double

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            HStack {
                Text("Progress")
                    .font(.Carebase.labelMedium)
                    .foregroundColor(Color.Carebase.textSecondary)

                Spacer()

                Text("\(Int(progress * 100))%")
                    .font(.Carebase.labelMedium)
                    .foregroundColor(Color.Carebase.textPrimary)
            }

            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.Carebase.backgroundTertiary)

                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.Carebase.accent)
                        .frame(width: geometry.size.width * progress)
                }
            }
            .frame(height: 8)
        }
    }
}

// MARK: - View Model
@MainActor
class NewVisitNoteViewModel: ObservableObject {
    @Published var templates: [FormTemplate] = []
    @Published var selectedTemplate: FormTemplate?
    @Published var formData: [String: Any] = [:]
    @Published var isLoading = false
    @Published var isSubmitted = false
    @Published var error: String?  // Error loading templates
    @Published var submitError: String?  // Error submitting form

    var shiftId: String = ""
    var clientId: String = ""

    private let api = APIClient.shared

    var canSubmit: Bool {
        guard let template = selectedTemplate,
              let sections = template.sections else { return false }

        // Check all required fields are filled
        for section in sections {
            for field in section.fields where field.required {
                if formData[field.id] == nil {
                    return false
                }
            }
        }
        return true
    }

    var completionProgress: Double {
        guard let template = selectedTemplate,
              let sections = template.sections else { return 0 }

        let totalFields = sections.flatMap { $0.fields }.count
        let filledFields = formData.keys.count

        return totalFields > 0 ? Double(filledFields) / Double(totalFields) : 0
    }

    func loadTemplates() async {
        isLoading = true
        error = nil

        do {
            #if DEBUG
            print("Loading form templates from API...")
            #endif

            let response: TemplatesResponse = try await api.request(endpoint: .enabledTemplates)
            self.templates = response.templates

            #if DEBUG
            print("Loaded \(response.templates.count) form templates")
            for template in response.templates {
                print("  - \(template.name): \(template.sections?.count ?? 0) sections")
            }
            #endif
        } catch let apiError as APIError {
            self.error = apiError.errorDescription
            #if DEBUG
            print("API Error loading templates: \(apiError.errorDescription ?? "Unknown")")
            #endif
        } catch let decodingError as DecodingError {
            self.error = "Invalid response format"
            #if DEBUG
            print("Decoding Error loading templates:")
            switch decodingError {
            case .keyNotFound(let key, let context):
                print("  Key '\(key.stringValue)' not found: \(context.debugDescription)")
                print("  Path: \(context.codingPath.map { $0.stringValue }.joined(separator: "."))")
            case .typeMismatch(let type, let context):
                print("  Type mismatch for \(type): \(context.debugDescription)")
                print("  Path: \(context.codingPath.map { $0.stringValue }.joined(separator: "."))")
            case .valueNotFound(let type, let context):
                print("  Value of type \(type) not found: \(context.debugDescription)")
                print("  Path: \(context.codingPath.map { $0.stringValue }.joined(separator: "."))")
            case .dataCorrupted(let context):
                print("  Data corrupted: \(context.debugDescription)")
                print("  Path: \(context.codingPath.map { $0.stringValue }.joined(separator: "."))")
            @unknown default:
                print("  Unknown decoding error: \(decodingError)")
            }
            #endif
        } catch {
            self.error = "Failed to load templates"
            #if DEBUG
            print("Unknown error loading templates: \(error)")
            #endif
        }

        isLoading = false
    }

    func selectTemplate(_ template: FormTemplate) {
        selectedTemplate = template
        HapticType.light.trigger()
    }

    func submit() async {
        guard let template = selectedTemplate else { return }

        isLoading = true
        submitError = nil

        do {
            // Convert formData to AnyCodable
            let codableData = formData.mapValues { AnyCodable($0) }

            let request = CreateVisitNoteRequest(
                templateId: template.id,
                shiftId: shiftId,
                clientId: clientId,
                data: codableData
            )

            let _: VisitNoteResponse = try await api.request(
                endpoint: .visitNotes,
                method: .post,
                body: request
            )

            isSubmitted = true

            #if DEBUG
            print("Visit note submitted successfully")
            #endif
        } catch let apiError as APIError {
            self.submitError = apiError.errorDescription
            #if DEBUG
            print("Visit note submit error: \(apiError)")
            #endif
        } catch {
            self.submitError = "Failed to submit visit note"
            #if DEBUG
            print("Visit note submit error: \(error)")
            #endif
        }

        isLoading = false
    }
}

// MARK: - Visit Note Detail View
struct VisitNoteDetailView: View {
    let noteId: String
    @StateObject private var viewModel = VisitNoteDetailViewModel()

    var body: some View {
        ScrollView {
            if let note = viewModel.note {
                VStack(spacing: Spacing.xl) {
                    // Header
                    NoteHeaderSection(note: note)

                    // Form Data
                    if let snapshot = note.formSchemaSnapshot,
                       let sections = snapshot.sections {
                        ForEach(sections) { section in
                            NoteFormSection(section: section, data: note.data)
                        }
                    } else {
                        // Fallback for notes without schema snapshot
                        NoteDataFallback(data: note.data)
                    }
                }
                .padding(.vertical, Spacing.lg)
            } else if viewModel.isLoading {
                LoadingView()
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
            VStack(spacing: Spacing.md) {
                HStack(spacing: Spacing.md) {
                    Image(systemName: "doc.text.fill")
                        .font(.system(size: 24, weight: .medium))
                        .foregroundColor(Color.Carebase.accent)
                        .frame(width: 56, height: 56)
                        .background(Color.Carebase.accentSoft)
                        .clipShape(Circle())

                    VStack(alignment: .leading, spacing: Spacing.xxs) {
                        Text(note.templateName)
                            .font(.Carebase.headlineMedium)
                            .foregroundColor(Color.Carebase.textPrimary)

                        if let client = note.client {
                            Text(client.fullName)
                                .font(.Carebase.bodyMedium)
                                .foregroundColor(Color.Carebase.textSecondary)
                        }
                    }

                    Spacer()
                }

                Divider()

                HStack {
                    VStack(alignment: .leading, spacing: Spacing.xxs) {
                        Text("Submitted")
                            .font(.Carebase.labelSmall)
                            .foregroundColor(Color.Carebase.textTertiary)
                        Text(note.submittedAtFormatted)
                            .font(.Carebase.bodyMedium)
                            .foregroundColor(Color.Carebase.textPrimary)
                    }

                    Spacer()

                    if let carer = note.carer {
                        VStack(alignment: .trailing, spacing: Spacing.xxs) {
                            Text("By")
                                .font(.Carebase.labelSmall)
                                .foregroundColor(Color.Carebase.textTertiary)
                            Text(carer.fullName)
                                .font(.Carebase.bodyMedium)
                                .foregroundColor(Color.Carebase.textPrimary)
                        }
                    }
                }
            }
        }
        .screenPadding()
    }
}

// MARK: - Note Form Section
struct NoteFormSection: View {
    let section: FormSection
    let data: [String: AnyCodable]?

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            Text(section.title)
                .font(.Carebase.headlineSmall)
                .foregroundColor(Color.Carebase.textPrimary)
                .screenPadding()

            CarebaseCard {
                VStack(spacing: Spacing.lg) {
                    ForEach(section.fields.sorted(by: { $0.order < $1.order })) { field in
                        NoteFieldDisplay(field: field, value: data?[field.id])

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

// MARK: - Note Field Display
struct NoteFieldDisplay: View {
    let field: FormField
    let value: AnyCodable?

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            Text(field.label)
                .font(.Carebase.labelMedium)
                .foregroundColor(Color.Carebase.textSecondary)

            Text(displayValue)
                .font(.Carebase.bodyLarge)
                .foregroundColor(Color.Carebase.textPrimary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var displayValue: String {
        guard let value = value else { return "—" }

        switch value.value {
        case let string as String:
            return string.isEmpty ? "—" : string
        case let int as Int:
            if field.type == .ratingScale {
                return String(repeating: "★", count: int) + String(repeating: "☆", count: max(0, 5 - int))
            }
            return "\(int)"
        case let double as Double:
            return String(format: "%.1f", double)
        case let bool as Bool:
            return bool ? "Yes" : "No"
        case let array as [Any]:
            let strings = array.compactMap { $0 as? String }
            return strings.isEmpty ? "—" : strings.joined(separator: ", ")
        default:
            return "—"
        }
    }
}

// MARK: - Note Data Fallback
struct NoteDataFallback: View {
    let data: [String: AnyCodable]?

    var body: some View {
        if let data = data, !data.isEmpty {
            CarebaseCard {
                VStack(alignment: .leading, spacing: Spacing.md) {
                    Text("Submitted Data")
                        .font(.Carebase.headlineSmall)
                        .foregroundColor(Color.Carebase.textPrimary)

                    ForEach(Array(data.keys.sorted()), id: \.self) { key in
                        if let value = data[key] {
                            VStack(alignment: .leading, spacing: Spacing.xxs) {
                                Text(key)
                                    .font(.Carebase.labelMedium)
                                    .foregroundColor(Color.Carebase.textSecondary)
                                Text(String(describing: value.value))
                                    .font(.Carebase.bodyMedium)
                                    .foregroundColor(Color.Carebase.textPrimary)
                            }

                            if key != data.keys.sorted().last {
                                Divider()
                            }
                        }
                    }
                }
            }
            .screenPadding()
        } else {
            VStack(spacing: Spacing.md) {
                Image(systemName: "doc.text")
                    .font(.system(size: 48, weight: .light))
                    .foregroundColor(Color.Carebase.textTertiary)

                Text("No form data available")
                    .font(.Carebase.bodyMedium)
                    .foregroundColor(Color.Carebase.textSecondary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, Spacing.xxl)
        }
    }
}

// MARK: - Visit Note Detail View Model
@MainActor
class VisitNoteDetailViewModel: ObservableObject {
    @Published var note: VisitNote?
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIClient.shared

    func loadNote(id: String) async {
        isLoading = true
        error = nil

        do {
            let response: VisitNoteResponse = try await api.request(endpoint: .visitNote(id: id))
            self.note = response.visitNote
        } catch let apiError as APIError {
            self.error = apiError.errorDescription
        } catch {
            self.error = "Failed to load visit note"
        }

        isLoading = false
    }
}

#Preview {
    NewVisitNoteView(shiftId: "1")
}
