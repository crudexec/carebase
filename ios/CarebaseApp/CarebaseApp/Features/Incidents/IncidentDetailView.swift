import SwiftUI

struct IncidentDetailView: View {
    @Environment(\.dismiss) private var dismiss
    let incident: Incident

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: Spacing.lg) {
                    // Header
                    VStack(alignment: .leading, spacing: Spacing.sm) {
                        HStack {
                            Text(incident.category)
                                .font(.title2)
                                .fontWeight(.bold)
                            Spacer()
                            SeverityBadge(severity: incident.severity)
                        }

                        HStack {
                            StatusBadgeView(status: incident.status)
                            Spacer()
                        }
                    }
                    .padding()
                    .background(Color.Carebase.surface)
                    .cornerRadius(12)

                    // Client Info
                    CarebaseCard {
                        VStack(alignment: .leading, spacing: Spacing.md) {
                            Label("Client", systemImage: "person.fill")
                                .font(.headline)
                                .foregroundColor(Color.Carebase.accent)

                            HStack {
                                Circle()
                                    .fill(Color.Carebase.error.opacity(0.2))
                                    .frame(width: 40, height: 40)
                                    .overlay(
                                        Text(String(incident.client.firstName.prefix(1)) + String(incident.client.lastName.prefix(1)))
                                            .font(.subheadline)
                                            .fontWeight(.semibold)
                                            .foregroundColor(Color.Carebase.error)
                                    )

                                VStack(alignment: .leading, spacing: 2) {
                                    Text(incident.client.fullName)
                                        .font(.headline)
                                }
                            }
                        }
                    }

                    // Incident Details
                    CarebaseCard {
                        VStack(alignment: .leading, spacing: Spacing.md) {
                            Label("Incident Details", systemImage: "doc.text.fill")
                                .font(.headline)
                                .foregroundColor(Color.Carebase.accent)

                            DetailRow(icon: "calendar", title: "Date", value: incident.dateOnly)
                            DetailRow(icon: "clock", title: "Time", value: incident.timeOnly)
                            DetailRow(icon: "location.fill", title: "Location", value: incident.location)
                        }
                    }

                    // Description
                    CarebaseCard {
                        VStack(alignment: .leading, spacing: Spacing.sm) {
                            Label("Description", systemImage: "text.alignleft")
                                .font(.headline)
                                .foregroundColor(Color.Carebase.accent)

                            Text(incident.description)
                                .font(.body)
                                .foregroundColor(Color.Carebase.textSecondary)
                        }
                    }

                    // Actions Taken
                    CarebaseCard {
                        VStack(alignment: .leading, spacing: Spacing.sm) {
                            Label("Actions Taken", systemImage: "checkmark.shield.fill")
                                .font(.headline)
                                .foregroundColor(Color.Carebase.accent)

                            Text(incident.actionsTaken)
                                .font(.body)
                                .foregroundColor(Color.Carebase.textSecondary)
                        }
                    }

                    // Witnesses
                    if let witnesses = incident.witnesses, !witnesses.isEmpty {
                        CarebaseCard {
                            VStack(alignment: .leading, spacing: Spacing.sm) {
                                Label("Witnesses", systemImage: "person.2.fill")
                                    .font(.headline)
                                    .foregroundColor(Color.Carebase.accent)

                                Text(witnesses)
                                    .font(.body)
                                    .foregroundColor(Color.Carebase.textSecondary)
                            }
                        }
                    }

                    // Reporter Info
                    CarebaseCard {
                        VStack(alignment: .leading, spacing: Spacing.md) {
                            Label("Reported By", systemImage: "person.badge.shield.checkmark.fill")
                                .font(.headline)
                                .foregroundColor(Color.Carebase.accent)

                            HStack {
                                Circle()
                                    .fill(Color.Carebase.accent.opacity(0.2))
                                    .frame(width: 40, height: 40)
                                    .overlay(
                                        Text(String(incident.reporter.firstName.prefix(1)) + String(incident.reporter.lastName.prefix(1)))
                                            .font(.subheadline)
                                            .fontWeight(.semibold)
                                            .foregroundColor(Color.Carebase.accent)
                                    )

                                VStack(alignment: .leading, spacing: 2) {
                                    Text(incident.reporter.fullName)
                                        .font(.headline)
                                    Text(incident.reporter.role.replacingOccurrences(of: "_", with: " ").capitalized)
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                            }

                            let formatter = DateFormatter()
                            let _ = formatter.dateStyle = .medium
                            let _ = formatter.timeStyle = .short
                            Text("Submitted on \(formatter.string(from: incident.createdAt))")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }

                    // Approval Info
                    if incident.status != .pending {
                        CarebaseCard {
                            VStack(alignment: .leading, spacing: Spacing.md) {
                                Label(
                                    incident.status == .approved ? "Approved" : "Rejected",
                                    systemImage: incident.status == .approved ? "checkmark.circle.fill" : "xmark.circle.fill"
                                )
                                .font(.headline)
                                .foregroundColor(incident.status.color)

                                if let approver = incident.approvedBy {
                                    HStack {
                                        Image(systemName: "person.fill")
                                            .foregroundColor(.secondary)
                                        Text("By \(approver.fullName)")
                                            .font(.subheadline)
                                    }
                                }

                                if let approvedAt = incident.approvedAt {
                                    let formatter = DateFormatter()
                                    let _ = formatter.dateStyle = .medium
                                    let _ = formatter.timeStyle = .short
                                    HStack {
                                        Image(systemName: "calendar")
                                            .foregroundColor(.secondary)
                                        Text(formatter.string(from: approvedAt))
                                            .font(.subheadline)
                                    }
                                }

                                if incident.status == .approved && incident.sponsorNotified {
                                    HStack {
                                        Image(systemName: "bell.fill")
                                            .foregroundColor(.green)
                                        Text("Sponsor has been notified")
                                            .font(.caption)
                                            .foregroundColor(.green)
                                    }
                                }
                            }
                        }
                    }
                }
                .padding()
            }
            .background(Color.Carebase.background)
            .navigationTitle("Incident Report")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

struct DetailRow: View {
    let icon: String
    let title: String
    let value: String

    var body: some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(.secondary)
                .frame(width: 24)
            Text(title)
                .foregroundColor(.secondary)
            Spacer()
            Text(value)
                .fontWeight(.medium)
        }
    }
}

#Preview {
    IncidentDetailView(incident: Incident(
        id: "1",
        incidentDate: Date(),
        location: "Living Room",
        category: "Fall",
        severity: .medium,
        description: "Client slipped while walking to the bathroom. No visible injuries.",
        actionsTaken: "Helped client up, checked for injuries, documented incident.",
        witnesses: "John Smith",
        attachments: [],
        status: .pending,
        sponsorNotified: false,
        createdAt: Date(),
        client: IncidentClient(id: "c1", firstName: "Jane", lastName: "Doe"),
        reporter: IncidentReporter(id: "r1", firstName: "Mary", lastName: "Johnson", role: "CARER"),
        approvedBy: nil,
        approvedAt: nil
    ))
}
