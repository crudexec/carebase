import XCTest
@testable import CarebaseApp

final class ModelsTests: XCTestCase {

    // MARK: - User Model Tests

    func testUserDecoding() throws {
        let json = """
        {
            "id": "user-123",
            "email": "test@example.com",
            "firstName": "John",
            "lastName": "Doe",
            "role": "CARER",
            "phone": "+1234567890",
            "profileImageURL": null,
            "isActive": true,
            "companyId": "company-123",
            "createdAt": "2024-01-15T10:30:00.000Z",
            "updatedAt": "2024-01-15T10:30:00.000Z"
        }
        """.data(using: .utf8)!

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601

        let user = try decoder.decode(User.self, from: json)

        XCTAssertEqual(user.id, "user-123")
        XCTAssertEqual(user.email, "test@example.com")
        XCTAssertEqual(user.firstName, "John")
        XCTAssertEqual(user.lastName, "Doe")
        XCTAssertEqual(user.role, .carer)
        XCTAssertEqual(user.phone, "+1234567890")
        XCTAssertNil(user.profileImageURL)
        XCTAssertTrue(user.isActive)
        XCTAssertEqual(user.companyId, "company-123")
    }

    func testUserFullName() throws {
        let json = """
        {
            "id": "user-123",
            "email": "test@example.com",
            "firstName": "John",
            "lastName": "Doe",
            "role": "CARER",
            "phone": null,
            "profileImageURL": null,
            "isActive": true,
            "companyId": "company-123",
            "createdAt": "2024-01-15T10:30:00.000Z",
            "updatedAt": "2024-01-15T10:30:00.000Z"
        }
        """.data(using: .utf8)!

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601

        let user = try decoder.decode(User.self, from: json)
        XCTAssertEqual(user.fullName, "John Doe")
        XCTAssertEqual(user.initials, "JD")
    }

    func testAllUserRoles() {
        XCTAssertEqual(UserRole.admin.rawValue, "ADMIN")
        XCTAssertEqual(UserRole.opsManager.rawValue, "OPS_MANAGER")
        XCTAssertEqual(UserRole.clinicalDirector.rawValue, "CLINICAL_DIRECTOR")
        XCTAssertEqual(UserRole.staff.rawValue, "STAFF")
        XCTAssertEqual(UserRole.supervisor.rawValue, "SUPERVISOR")
        XCTAssertEqual(UserRole.carer.rawValue, "CARER")
        XCTAssertEqual(UserRole.sponsor.rawValue, "SPONSOR")
    }

    // MARK: - Client Model Tests

    func testClientDecoding() throws {
        let json = """
        {
            "id": "client-123",
            "firstName": "Margaret",
            "lastName": "Thompson",
            "dateOfBirth": "1945-03-15T00:00:00.000Z",
            "phone": "+1234567890",
            "address": "123 Oak Street, Springfield",
            "status": "ACTIVE",
            "medicalNotes": "Requires assistance with mobility",
            "createdAt": "2024-01-15T10:30:00.000Z",
            "updatedAt": "2024-01-15T10:30:00.000Z",
            "sponsor": {
                "id": "sponsor-123",
                "firstName": "Jane",
                "lastName": "Thompson"
            },
            "assignedCarer": {
                "id": "carer-123",
                "firstName": "Sarah",
                "lastName": "Johnson"
            }
        }
        """.data(using: .utf8)!

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601

        let client = try decoder.decode(Client.self, from: json)

        XCTAssertEqual(client.id, "client-123")
        XCTAssertEqual(client.firstName, "Margaret")
        XCTAssertEqual(client.lastName, "Thompson")
        XCTAssertEqual(client.fullName, "Margaret Thompson")
        XCTAssertNotNil(client.dateOfBirth)
        XCTAssertEqual(client.phone, "+1234567890")
        XCTAssertEqual(client.address, "123 Oak Street, Springfield")
        XCTAssertEqual(client.status, .active)
        XCTAssertEqual(client.medicalNotes, "Requires assistance with mobility")
        XCTAssertNotNil(client.sponsor)
        XCTAssertEqual(client.sponsor?.fullName, "Jane Thompson")
        XCTAssertNotNil(client.assignedCarer)
        XCTAssertEqual(client.assignedCarer?.fullName, "Sarah Johnson")
    }

    func testClientDecodingWithNullFields() throws {
        let json = """
        {
            "id": "client-123",
            "firstName": "Margaret",
            "lastName": "Thompson",
            "dateOfBirth": null,
            "phone": null,
            "address": null,
            "status": "PROSPECT",
            "medicalNotes": null,
            "createdAt": "2024-01-15T10:30:00.000Z",
            "updatedAt": "2024-01-15T10:30:00.000Z",
            "sponsor": null,
            "assignedCarer": null
        }
        """.data(using: .utf8)!

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601

        let client = try decoder.decode(Client.self, from: json)

        XCTAssertEqual(client.id, "client-123")
        XCTAssertNil(client.dateOfBirth)
        XCTAssertNil(client.phone)
        XCTAssertNil(client.address)
        XCTAssertEqual(client.status, .prospect)
        XCTAssertNil(client.medicalNotes)
        XCTAssertNil(client.sponsor)
        XCTAssertNil(client.assignedCarer)
    }

    func testClientAge() throws {
        let calendar = Calendar.current
        let birthDate = calendar.date(byAdding: .year, value: -75, to: Date())!
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        let json = """
        {
            "id": "client-123",
            "firstName": "Margaret",
            "lastName": "Thompson",
            "dateOfBirth": "\(formatter.string(from: birthDate))",
            "phone": null,
            "address": null,
            "status": "ACTIVE",
            "medicalNotes": null,
            "createdAt": "2024-01-15T10:30:00.000Z",
            "updatedAt": "2024-01-15T10:30:00.000Z",
            "sponsor": null,
            "assignedCarer": null
        }
        """.data(using: .utf8)!

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601

        let client = try decoder.decode(Client.self, from: json)

        XCTAssertNotNil(client.age)
        XCTAssertEqual(client.age, 75)
    }

    func testAllClientStatuses() {
        XCTAssertEqual(ClientStatus.prospect.rawValue, "PROSPECT")
        XCTAssertEqual(ClientStatus.onboarding.rawValue, "ONBOARDING")
        XCTAssertEqual(ClientStatus.active.rawValue, "ACTIVE")
        XCTAssertEqual(ClientStatus.inactive.rawValue, "INACTIVE")
    }

    // MARK: - Shift Model Tests

    func testShiftDecoding() throws {
        let json = """
        {
            "id": "shift-123",
            "clientId": "client-123",
            "carerId": "carer-123",
            "scheduledStart": "2024-01-15T09:00:00.000Z",
            "scheduledEnd": "2024-01-15T12:00:00.000Z",
            "actualStart": "2024-01-15T09:05:00.000Z",
            "actualEnd": null,
            "status": "IN_PROGRESS",
            "notes": "Morning care shift",
            "carer": {
                "id": "carer-123",
                "firstName": "Sarah",
                "lastName": "Johnson"
            },
            "client": {
                "id": "client-123",
                "firstName": "Margaret",
                "lastName": "Thompson",
                "address": "123 Oak Street"
            },
            "createdAt": "2024-01-14T10:30:00.000Z",
            "updatedAt": "2024-01-15T09:05:00.000Z"
        }
        """.data(using: .utf8)!

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601

        let shift = try decoder.decode(Shift.self, from: json)

        XCTAssertEqual(shift.id, "shift-123")
        XCTAssertEqual(shift.clientId, "client-123")
        XCTAssertEqual(shift.carerId, "carer-123")
        XCTAssertEqual(shift.status, .inProgress)
        XCTAssertEqual(shift.notes, "Morning care shift")
        XCTAssertNotNil(shift.actualStart)
        XCTAssertNil(shift.actualEnd)
        XCTAssertNotNil(shift.carer)
        XCTAssertEqual(shift.carer?.fullName, "Sarah Johnson")
        XCTAssertNotNil(shift.client)
        XCTAssertEqual(shift.client?.fullName, "Margaret Thompson")
        XCTAssertEqual(shift.client?.address, "123 Oak Street")
    }

    func testShiftDuration() throws {
        let json = """
        {
            "id": "shift-123",
            "clientId": "client-123",
            "carerId": "carer-123",
            "scheduledStart": "2024-01-15T09:00:00.000Z",
            "scheduledEnd": "2024-01-15T12:00:00.000Z",
            "actualStart": null,
            "actualEnd": null,
            "status": "SCHEDULED",
            "notes": null,
            "carer": null,
            "client": null,
            "createdAt": "2024-01-14T10:30:00.000Z",
            "updatedAt": "2024-01-14T10:30:00.000Z"
        }
        """.data(using: .utf8)!

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601

        let shift = try decoder.decode(Shift.self, from: json)

        // Duration should be 3 hours = 10800 seconds
        XCTAssertEqual(shift.duration, 10800)
        XCTAssertEqual(shift.durationFormatted, "3h")
    }

    func testAllShiftStatuses() {
        XCTAssertEqual(ShiftStatus.scheduled.rawValue, "SCHEDULED")
        XCTAssertEqual(ShiftStatus.inProgress.rawValue, "IN_PROGRESS")
        XCTAssertEqual(ShiftStatus.completed.rawValue, "COMPLETED")
        XCTAssertEqual(ShiftStatus.cancelled.rawValue, "CANCELLED")
        XCTAssertEqual(ShiftStatus.noShow.rawValue, "NO_SHOW")
    }

    // MARK: - Visit Note Model Tests

    func testVisitNoteDecoding() throws {
        let json = """
        {
            "id": "note-123",
            "templateId": "template-123",
            "templateVersion": 1,
            "shiftId": "shift-123",
            "clientId": "client-123",
            "carerId": "carer-123",
            "submittedById": "carer-123",
            "submittedAt": "2024-01-15T12:00:00.000Z",
            "formSchemaSnapshot": {
                "templateId": "template-123",
                "templateName": "Daily Care Report",
                "version": 1,
                "sections": []
            },
            "data": {
                "activities": "Helped with breakfast",
                "mood": "Good"
            },
            "template": {
                "id": "template-123",
                "name": "Daily Care Report"
            },
            "client": {
                "id": "client-123",
                "firstName": "Margaret",
                "lastName": "Thompson"
            },
            "carer": {
                "id": "carer-123",
                "firstName": "Sarah",
                "lastName": "Johnson"
            },
            "submittedBy": {
                "id": "carer-123",
                "firstName": "Sarah",
                "lastName": "Johnson"
            },
            "shift": {
                "id": "shift-123",
                "scheduledStart": "2024-01-15T09:00:00.000Z",
                "scheduledEnd": "2024-01-15T12:00:00.000Z"
            }
        }
        """.data(using: .utf8)!

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601

        let note = try decoder.decode(VisitNote.self, from: json)

        XCTAssertEqual(note.id, "note-123")
        XCTAssertEqual(note.templateId, "template-123")
        XCTAssertEqual(note.templateVersion, 1)
        XCTAssertEqual(note.shiftId, "shift-123")
        XCTAssertEqual(note.templateName, "Daily Care Report")
        XCTAssertNotNil(note.client)
        XCTAssertEqual(note.client?.fullName, "Margaret Thompson")
        XCTAssertNotNil(note.carer)
        XCTAssertEqual(note.carer?.fullName, "Sarah Johnson")
        XCTAssertNotNil(note.data)
    }

    // MARK: - Form Template Model Tests

    func testFormFieldTypes() {
        XCTAssertEqual(FormFieldType.textShort.rawValue, "TEXT_SHORT")
        XCTAssertEqual(FormFieldType.textLong.rawValue, "TEXT_LONG")
        XCTAssertEqual(FormFieldType.number.rawValue, "NUMBER")
        XCTAssertEqual(FormFieldType.yesNo.rawValue, "YES_NO")
        XCTAssertEqual(FormFieldType.singleChoice.rawValue, "SINGLE_CHOICE")
        XCTAssertEqual(FormFieldType.multipleChoice.rawValue, "MULTIPLE_CHOICE")
        XCTAssertEqual(FormFieldType.date.rawValue, "DATE")
        XCTAssertEqual(FormFieldType.time.rawValue, "TIME")
        XCTAssertEqual(FormFieldType.dateTime.rawValue, "DATETIME")
        XCTAssertEqual(FormFieldType.signature.rawValue, "SIGNATURE")
        XCTAssertEqual(FormFieldType.photo.rawValue, "PHOTO")
        XCTAssertEqual(FormFieldType.ratingScale.rawValue, "RATING_SCALE")
    }

    func testFormTemplateDecoding() throws {
        let json = """
        {
            "id": "template-123",
            "name": "Daily Care Report",
            "description": "Standard daily care report for all clients",
            "isEnabled": true,
            "version": 2,
            "status": "ACTIVE",
            "sections": [
                {
                    "id": "section-1",
                    "title": "Basic Information",
                    "description": "Client condition overview",
                    "order": 0,
                    "fields": [
                        {
                            "id": "field-1",
                            "label": "Client Mood",
                            "description": "How is the client feeling today?",
                            "type": "SINGLE_CHOICE",
                            "required": true,
                            "order": 0,
                            "config": {
                                "options": [
                                    {"value": "good", "label": "Good"},
                                    {"value": "fair", "label": "Fair"},
                                    {"value": "poor", "label": "Poor"}
                                ]
                            }
                        }
                    ]
                }
            ]
        }
        """.data(using: .utf8)!

        let decoder = JSONDecoder()

        let template = try decoder.decode(FormTemplate.self, from: json)

        XCTAssertEqual(template.id, "template-123")
        XCTAssertEqual(template.name, "Daily Care Report")
        XCTAssertEqual(template.description, "Standard daily care report for all clients")
        XCTAssertEqual(template.isEnabled, true)
        XCTAssertEqual(template.version, 2)
        XCTAssertEqual(template.status, "ACTIVE")
        XCTAssertNotNil(template.sections)
        XCTAssertEqual(template.sections?.count, 1)

        let section = template.sections?.first
        XCTAssertEqual(section?.title, "Basic Information")
        XCTAssertEqual(section?.fields.count, 1)

        let field = section?.fields.first
        XCTAssertEqual(field?.label, "Client Mood")
        XCTAssertEqual(field?.type, .singleChoice)
        XCTAssertTrue(field?.required ?? false)
        XCTAssertNotNil(field?.config?.options)
        XCTAssertEqual(field?.config?.options?.count, 3)
    }

    // MARK: - API Response Model Tests

    func testClientsResponseDecoding() throws {
        let json = """
        {
            "clients": [
                {
                    "id": "client-1",
                    "firstName": "Margaret",
                    "lastName": "Thompson",
                    "dateOfBirth": null,
                    "phone": null,
                    "address": null,
                    "status": "ACTIVE",
                    "medicalNotes": null,
                    "createdAt": "2024-01-15T10:30:00.000Z",
                    "updatedAt": "2024-01-15T10:30:00.000Z",
                    "sponsor": null,
                    "assignedCarer": null
                }
            ],
            "pagination": {
                "page": 1,
                "limit": 50,
                "total": 1,
                "totalPages": 1
            }
        }
        """.data(using: .utf8)!

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601

        let response = try decoder.decode(ClientsResponse.self, from: json)

        XCTAssertEqual(response.clients.count, 1)
        XCTAssertNotNil(response.pagination)
        XCTAssertEqual(response.pagination?.page, 1)
        XCTAssertEqual(response.pagination?.total, 1)
    }

    func testShiftsResponseDecoding() throws {
        let json = """
        {
            "shifts": [
                {
                    "id": "shift-1",
                    "clientId": "client-1",
                    "carerId": "carer-1",
                    "scheduledStart": "2024-01-15T09:00:00.000Z",
                    "scheduledEnd": "2024-01-15T12:00:00.000Z",
                    "actualStart": null,
                    "actualEnd": null,
                    "status": "SCHEDULED",
                    "notes": null,
                    "carer": null,
                    "client": null,
                    "createdAt": "2024-01-14T10:30:00.000Z",
                    "updatedAt": "2024-01-14T10:30:00.000Z"
                }
            ]
        }
        """.data(using: .utf8)!

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601

        let response = try decoder.decode(ShiftsResponse.self, from: json)

        XCTAssertEqual(response.shifts.count, 1)
        XCTAssertEqual(response.shifts.first?.status, .scheduled)
    }

    // MARK: - AnyCodable Tests

    func testAnyCodableString() throws {
        let anyCodable = AnyCodable("test string")
        XCTAssertEqual(anyCodable.value as? String, "test string")
    }

    func testAnyCodableInt() throws {
        let anyCodable = AnyCodable(42)
        XCTAssertEqual(anyCodable.value as? Int, 42)
    }

    func testAnyCodableBool() throws {
        let anyCodable = AnyCodable(true)
        XCTAssertEqual(anyCodable.value as? Bool, true)
    }

    func testAnyCodableArray() throws {
        let json = """
        ["value1", "value2", "value3"]
        """.data(using: .utf8)!

        let decoder = JSONDecoder()
        let array = try decoder.decode([AnyCodable].self, from: json)

        XCTAssertEqual(array.count, 3)
        XCTAssertEqual(array[0].value as? String, "value1")
    }

    func testAnyCodableEncoding() throws {
        let original = AnyCodable("test")
        let encoder = JSONEncoder()
        let data = try encoder.encode(original)
        let decoder = JSONDecoder()
        let decoded = try decoder.decode(AnyCodable.self, from: data)

        XCTAssertEqual(decoded.value as? String, "test")
    }
}
