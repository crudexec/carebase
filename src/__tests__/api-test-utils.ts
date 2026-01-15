/**
 * API Test Utilities
 *
 * Use this file for integration tests that need to mock API responses.
 * Import the server and set up before/after hooks in your test file:
 *
 * ```typescript
 * import { server } from '@/__tests__/mocks/server';
 *
 * beforeAll(() => server.listen());
 * afterEach(() => server.resetHandlers());
 * afterAll(() => server.close());
 * ```
 */

export { server } from "./mocks/server";
export { handlers, mockUsers, mockClients } from "./mocks/handlers";

// Re-export MSW utilities for overriding handlers in tests
export { http, HttpResponse } from "msw";
