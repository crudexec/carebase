import { http, HttpResponse } from "msw";

// Mock data
export const mockUsers = [
  {
    id: "1",
    email: "admin@carebase.com",
    firstName: "Admin",
    lastName: "User",
    role: "ADMIN",
    isActive: true,
  },
  {
    id: "2",
    email: "carer@carebase.com",
    firstName: "John",
    lastName: "Doe",
    role: "CARER",
    isActive: true,
  },
  {
    id: "3",
    email: "sponsor@carebase.com",
    firstName: "Jane",
    lastName: "Smith",
    role: "SPONSOR",
    isActive: true,
  },
];

export const mockClients = [
  {
    id: "1",
    firstName: "Alice",
    lastName: "Johnson",
    status: "ACTIVE",
    sponsorId: "3",
    assignedCarerId: "2",
  },
];

// API handlers
export const handlers = [
  // Users
  http.get("/api/users", () => {
    return HttpResponse.json(mockUsers);
  }),

  http.get("/api/users/:id", ({ params }) => {
    const user = mockUsers.find((u) => u.id === params.id);
    if (!user) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(user);
  }),

  http.post("/api/users", async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newUser = {
      id: String(mockUsers.length + 1),
      ...body,
      isActive: true,
    };
    return HttpResponse.json(newUser, { status: 201 });
  }),

  // Clients
  http.get("/api/clients", () => {
    return HttpResponse.json(mockClients);
  }),

  http.get("/api/clients/:id", ({ params }) => {
    const client = mockClients.find((c) => c.id === params.id);
    if (!client) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(client);
  }),

  // Auth
  http.post("/api/auth/login", async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    const user = mockUsers.find((u) => u.email === body.email);

    if (!user || body.password !== "password123") {
      return HttpResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Invalid credentials" } },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      user,
      token: "mock-jwt-token",
    });
  }),

  http.get("/api/auth/me", ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    // Return first admin user as current user for testing
    return HttpResponse.json(mockUsers[0]);
  }),

  // Notifications
  http.get("/api/notifications", () => {
    return HttpResponse.json([
      {
        id: "1",
        type: "INFO",
        title: "Welcome",
        message: "Welcome to CareBase",
        read: false,
        createdAt: new Date().toISOString(),
      },
    ]);
  }),
];
