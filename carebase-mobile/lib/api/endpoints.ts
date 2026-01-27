export const endpoints = {
  // Auth
  login: '/api/auth/mobile/login',
  logout: '/api/auth/mobile/logout',
  session: '/api/auth/session',

  // Dashboard
  dashboardStats: '/api/dashboard/stats',
  recentActivity: '/api/dashboard/activity',

  // Shifts
  shifts: '/api/shifts',
  shift: (id: string) => `/api/shifts/${id}`,
  checkIn: (id: string) => `/api/check-in/${id}/check-in`,
  checkOut: (id: string) => `/api/check-in/${id}/check-out`,

  // Clients
  clients: '/api/clients',
  client: (id: string) => `/api/clients/${id}`,

  // Visit Notes
  visitNotes: '/api/visit-notes',
  visitNote: (id: string) => `/api/visit-notes/${id}`,
  formTemplatesEnabled: '/api/visit-notes/templates/enabled',
  formTemplate: (id: string) => `/api/visit-notes/templates/${id}`,

  // Incidents
  incidents: '/api/incidents',
  incident: (id: string) => `/api/incidents/${id}`,

  // Profile
  profile: '/api/profile',
} as const;
