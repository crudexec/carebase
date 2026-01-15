import Foundation

// MARK: - User Model
struct User: Codable, Identifiable {
    let id: String
    let email: String
    let firstName: String
    let lastName: String
    let role: UserRole
    let phone: String?
    let profileImageURL: String?
    let isActive: Bool
    let companyId: String
    let createdAt: Date
    let updatedAt: Date

    var fullName: String {
        "\(firstName) \(lastName)"
    }

    var initials: String {
        let first = firstName.prefix(1)
        let last = lastName.prefix(1)
        return "\(first)\(last)".uppercased()
    }

    // Create from session user
    init(from sessionUser: SessionUser) {
        self.id = sessionUser.id
        self.email = sessionUser.email
        self.firstName = sessionUser.firstName
        self.lastName = sessionUser.lastName
        self.role = UserRole(rawValue: sessionUser.role) ?? .carer
        self.phone = nil
        self.profileImageURL = nil
        self.isActive = true
        self.companyId = sessionUser.companyId
        self.createdAt = Date()
        self.updatedAt = Date()
    }

    init(id: String, email: String, firstName: String, lastName: String, role: UserRole, phone: String?, profileImageURL: String?, isActive: Bool, companyId: String, createdAt: Date, updatedAt: Date) {
        self.id = id
        self.email = email
        self.firstName = firstName
        self.lastName = lastName
        self.role = role
        self.phone = phone
        self.profileImageURL = profileImageURL
        self.isActive = isActive
        self.companyId = companyId
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

enum UserRole: String, Codable {
    case admin = "ADMIN"
    case opsManager = "OPS_MANAGER"
    case clinicalDirector = "CLINICAL_DIRECTOR"
    case staff = "STAFF"
    case supervisor = "SUPERVISOR"
    case carer = "CARER"
    case sponsor = "SPONSOR"

    var displayName: String {
        switch self {
        case .admin: return "Administrator"
        case .opsManager: return "Operations Manager"
        case .clinicalDirector: return "Clinical Director"
        case .staff: return "Staff"
        case .supervisor: return "Supervisor"
        case .carer: return "Carer"
        case .sponsor: return "Family Member"
        }
    }
}

// MARK: - Client Model
struct Client: Codable, Identifiable {
    let id: String
    let firstName: String
    let lastName: String
    let dateOfBirth: Date?
    let phone: String?
    let email: String?
    let address: String?
    let status: ClientStatus
    let profileImageURL: String?
    let medicalNotes: String?
    let createdAt: Date?
    let updatedAt: Date?
    let sponsor: ClientSponsor?
    let assignedCarer: ClientCarer?

    var fullName: String {
        "\(firstName) \(lastName)"
    }

    var age: Int? {
        guard let dob = dateOfBirth else { return nil }
        let calendar = Calendar.current
        let ageComponents = calendar.dateComponents([.year], from: dob, to: Date())
        return ageComponents.year
    }

    // For backwards compatibility
    var careNeeds: String? { medicalNotes }
}

struct ClientSponsor: Codable {
    let id: String
    let firstName: String
    let lastName: String

    var fullName: String { "\(firstName) \(lastName)" }
}

struct ClientCarer: Codable {
    let id: String
    let firstName: String
    let lastName: String

    var fullName: String { "\(firstName) \(lastName)" }
}

enum ClientStatus: String, Codable {
    case prospect = "PROSPECT"
    case onboarding = "ONBOARDING"
    case active = "ACTIVE"
    case inactive = "INACTIVE"

    var displayName: String {
        switch self {
        case .prospect: return "Prospect"
        case .onboarding: return "Onboarding"
        case .active: return "Active"
        case .inactive: return "Inactive"
        }
    }
}

// MARK: - Shift Model
struct Shift: Codable, Identifiable {
    let id: String
    let clientId: String
    let carerId: String
    let scheduledStart: Date
    let scheduledEnd: Date
    let actualStart: Date?
    let actualEnd: Date?
    let status: ShiftStatus
    let notes: String?
    let carer: ShiftCarer?
    let client: ShiftClient?
    let createdAt: Date?
    let updatedAt: Date?

    var duration: TimeInterval {
        scheduledEnd.timeIntervalSince(scheduledStart)
    }

    var durationFormatted: String {
        let hours = Int(duration / 3600)
        let minutes = Int((duration.truncatingRemainder(dividingBy: 3600)) / 60)
        if minutes == 0 {
            return "\(hours)h"
        }
        return "\(hours)h \(minutes)m"
    }

    var timeRangeFormatted: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"
        return "\(formatter.string(from: scheduledStart)) - \(formatter.string(from: scheduledEnd))"
    }

    var isToday: Bool {
        Calendar.current.isDateInToday(scheduledStart)
    }

    var isTomorrow: Bool {
        Calendar.current.isDateInTomorrow(scheduledStart)
    }

    // For backwards compatibility with views expecting address
    var address: Address? {
        if let addr = client?.address {
            return Address(street: addr, city: "", state: "", postalCode: "", country: "")
        }
        return nil
    }
}

struct ShiftCarer: Codable {
    let id: String
    let firstName: String
    let lastName: String

    var fullName: String { "\(firstName) \(lastName)" }
}

struct ShiftClient: Codable {
    let id: String
    let firstName: String
    let lastName: String
    let address: String?

    var fullName: String { "\(firstName) \(lastName)" }
}

enum ShiftStatus: String, Codable {
    case scheduled = "SCHEDULED"
    case inProgress = "IN_PROGRESS"
    case completed = "COMPLETED"
    case cancelled = "CANCELLED"
    case noShow = "NO_SHOW"

    var displayName: String {
        switch self {
        case .scheduled: return "Scheduled"
        case .inProgress: return "In Progress"
        case .completed: return "Completed"
        case .cancelled: return "Cancelled"
        case .noShow: return "No Show"
        }
    }

    var badgeStatus: StatusBadge.ShiftStatus {
        switch self {
        case .scheduled: return .scheduled
        case .inProgress: return .inProgress
        case .completed: return .completed
        case .cancelled, .noShow: return .cancelled
        }
    }
}

// Legacy Address struct for compatibility
struct Address: Codable {
    let street: String
    let city: String
    let state: String
    let postalCode: String
    let country: String

    var formatted: String {
        if city.isEmpty {
            return street
        }
        return "\(street), \(city), \(state) \(postalCode)"
    }

    var shortFormatted: String {
        if city.isEmpty {
            return street
        }
        return "\(street), \(city)"
    }
}

struct EmergencyContact: Codable {
    let name: String
    let relationship: String
    let phone: String
}

// MARK: - Visit Note Model
struct VisitNote: Codable, Identifiable {
    let id: String
    // These may come directly from API or from nested objects
    private let _templateName: String?
    let templateVersion: Int?
    let submittedAt: Date
    let formSchemaSnapshot: FormSchemaSnapshot?
    let data: [String: AnyCodable]?
    let template: VisitNoteTemplate?
    let client: VisitNoteClient?
    let carer: VisitNoteCarer?
    let submittedBy: VisitNoteSubmitter?
    let shift: VisitNoteShift?

    // Coding keys to handle API response format
    enum CodingKeys: String, CodingKey {
        case id
        case _templateName = "templateName"
        case templateVersion
        case submittedAt
        case formSchemaSnapshot
        case data
        case template
        case client
        case carer
        case submittedBy
        case shift
    }

    var templateName: String {
        _templateName ?? template?.name ?? formSchemaSnapshot?.templateName ?? "Visit Note"
    }

    var submittedAtFormatted: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: submittedAt)
    }
}

struct VisitNoteTemplate: Codable {
    let id: String
    let name: String
}

struct VisitNoteClient: Codable {
    let id: String
    let firstName: String
    let lastName: String

    var fullName: String { "\(firstName) \(lastName)" }
}

struct VisitNoteCarer: Codable {
    let id: String
    let firstName: String
    let lastName: String

    var fullName: String { "\(firstName) \(lastName)" }
}

struct VisitNoteSubmitter: Codable {
    let id: String
    let firstName: String
    let lastName: String

    var fullName: String { "\(firstName) \(lastName)" }
}

struct VisitNoteShift: Codable {
    let id: String
    let scheduledStart: Date
    let scheduledEnd: Date
}

struct FormSchemaSnapshot: Codable {
    let templateId: String?
    let templateName: String?
    let version: Int?
    let sections: [FormSection]?
}

// MARK: - Form Template Model
struct FormTemplate: Codable, Identifiable, Equatable {
    let id: String
    let name: String
    let description: String?
    let sections: [FormSection]?
    let isEnabled: Bool?
    let version: Int?
    let status: String?

    static func == (lhs: FormTemplate, rhs: FormTemplate) -> Bool {
        lhs.id == rhs.id
    }
}

struct FormSection: Codable, Identifiable {
    let id: String
    let title: String
    let description: String?
    let order: Int
    let fields: [FormField]

    private enum CodingKeys: String, CodingKey {
        case id, title, description, order, fields
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        title = try container.decode(String.self, forKey: .title)
        description = try container.decodeIfPresent(String.self, forKey: .description)
        order = try container.decodeIfPresent(Int.self, forKey: .order) ?? 0
        fields = try container.decodeIfPresent([FormField].self, forKey: .fields) ?? []
    }
}

struct FormField: Codable, Identifiable {
    let id: String
    let label: String
    let description: String?
    let type: FormFieldType
    let required: Bool
    let order: Int
    let config: FormFieldConfig?

    private enum CodingKeys: String, CodingKey {
        case id, label, description, type, required, order, config
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        label = try container.decode(String.self, forKey: .label)
        description = try container.decodeIfPresent(String.self, forKey: .description)
        type = try container.decodeIfPresent(FormFieldType.self, forKey: .type) ?? .textShort
        required = try container.decodeIfPresent(Bool.self, forKey: .required) ?? false
        order = try container.decodeIfPresent(Int.self, forKey: .order) ?? 0
        config = try container.decodeIfPresent(FormFieldConfig.self, forKey: .config)
    }
}

enum FormFieldType: String, Codable {
    case textShort = "TEXT_SHORT"
    case textLong = "TEXT_LONG"
    case number = "NUMBER"
    case yesNo = "YES_NO"
    case singleChoice = "SINGLE_CHOICE"
    case multipleChoice = "MULTIPLE_CHOICE"
    case date = "DATE"
    case time = "TIME"
    case dateTime = "DATETIME"
    case signature = "SIGNATURE"
    case photo = "PHOTO"
    case ratingScale = "RATING_SCALE"
}

struct FormFieldConfig: Codable {
    let options: [FieldOption]?
    let minValue: Int?
    let maxValue: Int?
    let min: Int?
    let max: Int?
    let maxLength: Int?
    let placeholder: String?

    // Computed property for backwards compatibility
    var optionStrings: [String]? {
        options?.map { $0.label }
    }

    private enum CodingKeys: String, CodingKey {
        case options, minValue, maxValue, min, max, maxLength, placeholder
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        placeholder = try container.decodeIfPresent(String.self, forKey: .placeholder)

        // Handle options as either [FieldOption] or [String]
        if let fieldOptions = try? container.decodeIfPresent([FieldOption].self, forKey: .options) {
            options = fieldOptions
        } else if let stringOptions = try? container.decodeIfPresent([String].self, forKey: .options) {
            // Convert strings to FieldOption objects
            options = stringOptions.map { FieldOption(value: $0, label: $0) }
        } else {
            options = nil
        }

        // Handle numeric values that might come as strings
        minValue = Self.decodeIntOrString(from: container, forKey: .minValue)
        maxValue = Self.decodeIntOrString(from: container, forKey: .maxValue)
        min = Self.decodeIntOrString(from: container, forKey: .min)
        max = Self.decodeIntOrString(from: container, forKey: .max)
        maxLength = Self.decodeIntOrString(from: container, forKey: .maxLength)
    }

    private static func decodeIntOrString(from container: KeyedDecodingContainer<CodingKeys>, forKey key: CodingKeys) -> Int? {
        if let intValue = try? container.decodeIfPresent(Int.self, forKey: key) {
            return intValue
        }
        if let stringValue = try? container.decodeIfPresent(String.self, forKey: key) {
            return Int(stringValue)
        }
        return nil
    }
}

struct FieldOption: Codable {
    let value: String
    let label: String
}

// MARK: - Notification Model
struct AppNotification: Codable, Identifiable {
    let id: String
    let type: String
    let title: String
    let message: String
    let link: String?
    let read: Bool
    let createdAt: Date

    // For backwards compatibility
    var isRead: Bool { read }

    var icon: String {
        switch type.uppercased() {
        case "SHIFT_REMINDER": return "calendar.badge.clock"
        case "SHIFT_ASSIGNED": return "calendar.badge.plus"
        case "SHIFT_CANCELLED": return "calendar.badge.minus"
        case "VISIT_NOTE_REMINDER": return "doc.text"
        case "MESSAGE": return "message.fill"
        default: return "bell.fill"
        }
    }
}

// MARK: - API Response Wrappers
struct ShiftsResponse: Codable {
    let shifts: [Shift]
}

struct ShiftResponse: Codable {
    let shift: Shift
}

struct ClientsResponse: Codable {
    let clients: [Client]
    let pagination: Pagination?
}

struct ClientResponse: Codable {
    let client: Client
}

struct VisitNotesResponse: Codable {
    let visitNotes: [VisitNote]
    let pagination: Pagination?
}

struct VisitNoteResponse: Codable {
    let visitNote: VisitNote
}

struct TemplatesResponse: Codable {
    let templates: [FormTemplate]
}

struct NotificationsResponse: Codable {
    let notifications: [AppNotification]
    let unreadCount: Int
}

struct Pagination: Codable {
    let page: Int
    let limit: Int
    let total: Int
    let totalPages: Int
}

// MARK: - Check-In/Out Responses
struct CheckInResponse: Codable {
    let success: Bool
    let message: String
    let shift: Shift
    let attendance: AttendanceRecord?
}

struct CheckOutResponse: Codable {
    let success: Bool
    let message: String
    let shift: Shift
    let attendance: AttendanceRecord?
}

struct AttendanceRecord: Codable {
    let id: String
    let date: Date
    let checkInTime: Date?
    let checkOutTime: Date?
    let hoursWorkedToday: Double?
}

// MARK: - Create Visit Note Request
struct CreateVisitNoteRequest: Codable {
    let templateId: String
    let shiftId: String
    let clientId: String
    let data: [String: AnyCodable]
}

// MARK: - Mark Notifications Request
struct MarkNotificationsRequest: Codable {
    let notificationIds: [String]?
    let markAllRead: Bool?
}

// MARK: - AnyCodable Helper
struct AnyCodable: Codable {
    let value: Any

    init(_ value: Any) {
        self.value = value
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()

        if let string = try? container.decode(String.self) {
            value = string
        } else if let int = try? container.decode(Int.self) {
            value = int
        } else if let double = try? container.decode(Double.self) {
            value = double
        } else if let bool = try? container.decode(Bool.self) {
            value = bool
        } else if let array = try? container.decode([AnyCodable].self) {
            value = array.map { $0.value }
        } else if let dict = try? container.decode([String: AnyCodable].self) {
            value = dict.mapValues { $0.value }
        } else {
            value = NSNull()
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()

        switch value {
        case let string as String:
            try container.encode(string)
        case let int as Int:
            try container.encode(int)
        case let double as Double:
            try container.encode(double)
        case let bool as Bool:
            try container.encode(bool)
        case let array as [Any]:
            try container.encode(array.map { AnyCodable($0) })
        case let dict as [String: Any]:
            try container.encode(dict.mapValues { AnyCodable($0) })
        default:
            try container.encodeNil()
        }
    }
}
