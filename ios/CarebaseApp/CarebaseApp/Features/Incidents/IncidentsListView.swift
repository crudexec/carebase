import SwiftUI

struct IncidentsListView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var incidents: [Incident] = []
    @State private var isLoading = true
    @State private var error: String?
    @State private var showNewIncident = false
    @State private var selectedIncident: Incident?

    var body: some View {
        NavigationStack {
            Group {
                if isLoading {
                    ProgressView("Loading incidents...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let error = error {
                    VStack(spacing: Spacing.md) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.largeTitle)
                            .foregroundColor(.orange)
                        Text(error)
                            .foregroundColor(.secondary)
                        Button("Try Again") {
                            Task { await fetchIncidents() }
                        }
                        .buttonStyle(.bordered)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if incidents.isEmpty {
                    VStack(spacing: Spacing.md) {
                        Image(systemName: "exclamationmark.shield")
                            .font(.system(size: 48))
                            .foregroundColor(Color.Carebase.textTertiary)
                        Text("No incidents reported")
                            .font(.headline)
                        Text("Tap the + button to report an incident")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    List {
                        ForEach(incidents) { incident in
                            IncidentRow(incident: incident)
                                .contentShape(Rectangle())
                                .onTapGesture {
                                    selectedIncident = incident
                                }
                        }
                    }
                    .listStyle(.plain)
                    .refreshable {
                        await fetchIncidents(isRefresh: true)
                    }
                }
            }
            .navigationTitle("Incidents")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showNewIncident = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showNewIncident) {
                NewIncidentView(onSubmit: {
                    Task { await fetchIncidents() }
                })
            }
            .sheet(item: $selectedIncident) { incident in
                IncidentDetailView(incident: incident)
            }
        }
        .task {
            await fetchIncidents()
        }
    }

    private func fetchIncidents(isRefresh: Bool = false) async {
        // Only show loading indicator on initial load, not during refresh
        if !isRefresh {
            isLoading = true
        }
        error = nil

        do {
            let response: IncidentsResponse = try await APIClient.shared.request(
                endpoint: .incidents,
                method: .get
            )
            await MainActor.run {
                incidents = response.incidents
                isLoading = false
            }
        } catch let apiError as APIError {
            await MainActor.run {
                // Only show error state if we have no data to display
                if incidents.isEmpty {
                    error = apiError.errorDescription ?? "An error occurred"
                }
                isLoading = false
            }
        } catch {
            await MainActor.run {
                // Only show error state if we have no data to display
                if incidents.isEmpty {
                    self.error = "Failed to load incidents"
                }
                isLoading = false
            }
        }
    }
}

struct IncidentRow: View {
    let incident: Incident

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            HStack {
                Text(incident.category)
                    .font(.headline)
                Spacer()
                SeverityBadge(severity: incident.severity)
            }

            HStack {
                Image(systemName: "person.fill")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text(incident.client.fullName)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }

            HStack {
                Image(systemName: "calendar")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text(incident.dateOnly)
                    .font(.caption)
                    .foregroundColor(.secondary)

                Spacer()

                StatusBadgeView(status: incident.status)
            }

            Text(incident.description)
                .font(.caption)
                .foregroundColor(.secondary)
                .lineLimit(2)
        }
        .padding(.vertical, Spacing.xs)
    }
}

struct SeverityBadge: View {
    let severity: IncidentSeverity

    var body: some View {
        Text(severity.displayName)
            .font(.caption2)
            .fontWeight(.semibold)
            .padding(.horizontal, Spacing.sm)
            .padding(.vertical, Spacing.xs)
            .background(severity.color.opacity(0.2))
            .foregroundColor(severity.color)
            .clipShape(Capsule())
    }
}

struct StatusBadgeView: View {
    let status: IncidentStatus

    var body: some View {
        HStack(spacing: 4) {
            Circle()
                .fill(status.color)
                .frame(width: 6, height: 6)
            Text(status.displayName)
                .font(.caption2)
        }
        .padding(.horizontal, Spacing.sm)
        .padding(.vertical, Spacing.xs)
        .background(status.color.opacity(0.1))
        .clipShape(Capsule())
    }
}

#Preview {
    IncidentsListView()
        .environmentObject(AuthenticationManager())
}
