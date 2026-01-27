import SwiftUI

struct NewIncidentView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var authManager: AuthenticationManager

    let onSubmit: () -> Void

    @State private var clients: [Client] = []
    @State private var selectedClientId: String = ""
    @State private var incidentDate = Date()
    @State private var location = ""
    @State private var category = ""
    @State private var severity: IncidentSeverity = .medium
    @State private var description = ""
    @State private var actionsTaken = ""
    @State private var witnesses = ""

    @State private var isLoading = false
    @State private var isSubmitting = false
    @State private var error: String?

    private let categories = [
        "Fall",
        "Medication Error",
        "Injury",
        "Behavioral",
        "Property Damage",
        "Abuse/Neglect",
        "Missing Person",
        "Medical Emergency",
        "Equipment Failure",
        "Other"
    ]

    var isFormValid: Bool {
        !selectedClientId.isEmpty &&
        !location.isEmpty &&
        !category.isEmpty &&
        description.count >= 10 &&
        !actionsTaken.isEmpty
    }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Picker("Client", selection: $selectedClientId) {
                        Text("Select a client").tag("")
                        ForEach(clients) { client in
                            Text(client.fullName).tag(client.id)
                        }
                    }

                    DatePicker("Date & Time", selection: $incidentDate)
                } header: {
                    Text("Incident Information")
                }

                Section {
                    Picker("Category", selection: $category) {
                        Text("Select category").tag("")
                        ForEach(categories, id: \.self) { cat in
                            Text(cat).tag(cat)
                        }
                    }

                    TextField("Location", text: $location)
                        .textContentType(.location)

                    Picker("Severity", selection: $severity) {
                        ForEach(IncidentSeverity.allCases, id: \.self) { level in
                            HStack {
                                Circle()
                                    .fill(level.color)
                                    .frame(width: 10, height: 10)
                                Text(level.displayName)
                            }
                            .tag(level)
                        }
                    }
                } header: {
                    Text("Classification")
                }

                Section {
                    TextEditor(text: $description)
                        .frame(minHeight: 100)
                } header: {
                    Text("Description")
                } footer: {
                    Text("Provide a detailed description of what happened (minimum 10 characters)")
                }

                Section {
                    TextEditor(text: $actionsTaken)
                        .frame(minHeight: 80)
                } header: {
                    Text("Actions Taken")
                } footer: {
                    Text("What immediate actions were taken in response?")
                }

                Section {
                    TextField("Witness names (optional)", text: $witnesses)
                } header: {
                    Text("Witnesses")
                }

                Section {
                    VStack(alignment: .leading, spacing: Spacing.sm) {
                        ForEach(IncidentSeverity.allCases, id: \.self) { level in
                            HStack(alignment: .top, spacing: Spacing.sm) {
                                Circle()
                                    .fill(level.color)
                                    .frame(width: 10, height: 10)
                                    .padding(.top, 4)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(level.displayName)
                                        .font(.subheadline)
                                        .fontWeight(.medium)
                                    Text(level.description)
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                            }
                        }
                    }
                    .padding(.vertical, Spacing.xs)
                } header: {
                    Text("Severity Guide")
                }
            }
            .navigationTitle("Report Incident")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .confirmationAction) {
                    Button("Submit") {
                        Task { await submitIncident() }
                    }
                    .disabled(!isFormValid || isSubmitting)
                }
            }
            .overlay {
                if isLoading {
                    ProgressView("Loading clients...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .background(Color.black.opacity(0.2))
                }

                if isSubmitting {
                    ProgressView("Submitting...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .background(Color.black.opacity(0.2))
                }
            }
            .alert("Error", isPresented: .constant(error != nil)) {
                Button("OK") { error = nil }
            } message: {
                Text(error ?? "")
            }
        }
        .task {
            await fetchClients()
        }
    }

    private func fetchClients() async {
        isLoading = true

        do {
            let response: ClientsResponse = try await APIClient.shared.request(
                endpoint: .clients,
                method: .get,
                queryParams: ["limit": "100"]
            )
            await MainActor.run {
                clients = response.clients
                isLoading = false
            }
        } catch {
            await MainActor.run {
                self.error = "Failed to load clients"
                isLoading = false
            }
        }
    }

    private func submitIncident() async {
        isSubmitting = true

        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime]

        let request = CreateIncidentRequest(
            clientId: selectedClientId,
            incidentDate: formatter.string(from: incidentDate),
            location: location,
            category: category,
            severity: severity.rawValue,
            description: description,
            actionsTaken: actionsTaken,
            witnesses: witnesses.isEmpty ? nil : witnesses
        )

        do {
            let _: IncidentResponse = try await APIClient.shared.request(
                endpoint: .incidents,
                method: .post,
                body: request
            )
            await MainActor.run {
                isSubmitting = false
                onSubmit()
                dismiss()
            }
        } catch let apiError as APIError {
            await MainActor.run {
                error = apiError.errorDescription ?? "An error occurred"
                isSubmitting = false
            }
        } catch {
            await MainActor.run {
                self.error = "Failed to submit incident"
                isSubmitting = false
            }
        }
    }
}

#Preview {
    NewIncidentView(onSubmit: {})
        .environmentObject(AuthenticationManager())
}
