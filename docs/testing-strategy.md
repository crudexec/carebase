# Testing Strategy

## Overview

CareBase follows a test-driven approach where every feature must have corresponding tests. Tests run automatically before commits to prevent regressions.

---

## Testing Pyramid

```
        ╱╲
       ╱  ╲        E2E Tests (Playwright)
      ╱────╲       - Critical user flows
     ╱      ╲      - Cross-browser testing
    ╱────────╲
   ╱          ╲    Integration Tests (Jest)
  ╱────────────╲   - API routes
 ╱              ╲  - Database operations
╱────────────────╲ - Auth flows
╱                  ╲
╱────────────────────╲  Unit Tests (Jest + RTL)
                        - Components
                        - Utilities
                        - Hooks
```

---

## Testing Tools

| Tool                          | Purpose                       |
| ----------------------------- | ----------------------------- |
| **Jest**                      | Test runner, assertions       |
| **React Testing Library**     | Component testing             |
| **Playwright**                | End-to-end testing            |
| **MSW (Mock Service Worker)** | API mocking                   |
| **Prisma**                    | Database testing with test DB |

---

## Test Requirements by Feature Type

### UI Components

- Renders correctly
- Handles user interactions
- Displays correct states (loading, error, empty)
- Accessibility (keyboard navigation, ARIA)

### API Routes

- Returns correct status codes
- Validates input data
- Handles authentication/authorization
- Returns expected response shape
- Handles errors gracefully

### Database Operations

- CRUD operations work correctly
- Relationships are maintained
- Constraints are enforced
- Migrations run cleanly

### Authentication

- Login/logout flows
- Session management
- Role-based access control
- Protected route behavior

### Business Logic

- Workflow transitions (onboarding stages, approvals)
- Notification triggers
- Permission checks
- Data validation

---

## File Structure

```
src/
├── __tests__/                    # Global test utilities
│   ├── setup.ts                  # Jest setup
│   ├── test-utils.tsx            # Custom render, providers
│   └── mocks/                    # MSW handlers, fixtures
├── app/
│   └── api/
│       └── users/
│           ├── route.ts
│           └── route.test.ts     # Co-located API tests
├── components/
│   └── ui/
│       └── Button/
│           ├── Button.tsx
│           └── Button.test.tsx   # Co-located component tests
├── lib/
│   └── utils/
│       ├── validation.ts
│       └── validation.test.ts    # Co-located utility tests
└── e2e/                          # Playwright E2E tests
    ├── auth.spec.ts
    ├── onboarding.spec.ts
    ├── payroll.spec.ts
    └── ...
```

---

## Naming Conventions

### Test Files

- Unit/Integration: `*.test.ts` or `*.test.tsx`
- E2E: `*.spec.ts`

### Test Descriptions

```typescript
describe("ComponentName", () => {
  describe("when condition", () => {
    it("should expected behavior", () => {
      // test
    });
  });
});
```

---

## Pre-Commit Hook

Tests run automatically before every commit using Husky + lint-staged.

### Configuration

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:ci": "jest --ci && playwright test"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "jest --bail --findRelatedTests"]
  }
}
```

### Husky Pre-Commit Hook

```bash
#!/bin/sh
# .husky/pre-commit

npx lint-staged
```

### What Runs on Commit

1. ESLint fixes auto-fixable issues
2. Jest runs tests related to changed files
3. Commit blocked if tests fail

### Full Test Suite

Run manually or in CI:

```bash
npm run test:ci
```

---

## Test Coverage Requirements

| Category          | Minimum Coverage |
| ----------------- | ---------------- |
| Utilities/Helpers | 90%              |
| API Routes        | 85%              |
| Components        | 80%              |
| Hooks             | 85%              |
| Overall           | 80%              |

Coverage reports generated with:

```bash
npm run test:coverage
```

---

## Testing Checklist for Features

Before marking any feature as complete:

- [ ] Unit tests for new components
- [ ] Unit tests for new utilities/hooks
- [ ] Integration tests for new API routes
- [ ] E2E test for critical user flows
- [ ] Tests pass locally
- [ ] Coverage meets minimum threshold
- [ ] No skipped tests without TODO comment

---

## Module-Specific Test Requirements

### Authentication

- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Session timeout behavior
- [ ] Password validation rules
- [ ] Protected route redirects

### Client Onboarding

- [ ] Kanban board renders all stages
- [ ] Cards can be created
- [ ] Stage transitions work
- [ ] Permission-based drag restrictions
- [ ] Clinical Director gate enforced
- [ ] Notifications triggered on transition

### Scheduling

- [ ] Calendar renders correctly
- [ ] Shifts can be created
- [ ] Double-booking prevented
- [ ] Notifications sent on changes

### Payroll

- [ ] Data entry form validation
- [ ] Compliance status displays
- [ ] Approval workflow transitions
- [ ] Payment cycle logic
- [ ] Notification triggers

### Incident Reporting

- [ ] Form validation
- [ ] File upload works
- [ ] Approval workflow
- [ ] Sponsor notification (post-approval only)
- [ ] Severity levels display correctly

### Daily Reports

- [ ] Form submission
- [ ] Image upload
- [ ] Compliance tracking
- [ ] Sponsor read-only view

### Chat

- [ ] Messages send/receive
- [ ] Real-time updates
- [ ] Message persistence
- [ ] Correct user pairing

### Invoices

- [ ] List displays correctly
- [ ] Mark as paid functionality
- [ ] Status updates

### Escalations

- [ ] Form submission
- [ ] Supervisor notifications
- [ ] Status transitions

---

## CI/CD Integration

GitHub Actions runs full test suite on:

- Every push to main
- Every pull request

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm ci
      - run: npm run test:ci
      - run: npm run test:coverage
```

---

## Mocking Strategies

### API Mocking (MSW)

```typescript
// src/__tests__/mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/users", () => {
    return HttpResponse.json([{ id: "1", name: "Test User" }]);
  }),
];
```

### Database Mocking (Prisma)

Use a separate test database or mock Prisma client:

```typescript
// src/__tests__/mocks/prisma.ts
import { mockDeep } from "jest-mock-extended";
import { PrismaClient } from "@prisma/client";

export const prismaMock = mockDeep<PrismaClient>();
```

---

**Last Updated:** 2026-01-13
