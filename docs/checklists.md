# Checklists

Admins enable **Settings → Checklists → Enable Checklists** and optionally **Show on dashboard**. Both controls apply to the company. The feature starts disabled; disabling it hides access but retains templates, assignments, comments, and files.

From **Checklists → Templates & assignments**, admins create ordered templates, edit or archive them, and assign a template to one or more active company users. Each assignment stores its own title, description, and item snapshots. Later template edits and archival never change existing assignments. Assigning a template again creates a new checklist.

The assigned user and company admins can check off items, comment, and attach files to that user's copy. Other assignees of the same template cannot access that copy. Item statuses are:

- **Not completed:** unchecked.
- **Awaiting approval:** checked, amber.
- **Approved:** approved by an admin, green.

Admins can return a submitted item for changes or reopen an approved item. Only admins can approve or reopen items. Approved items cannot be unchecked by the assigned user. All statuses have visible labels and icons as well as colors. Submission and approval actions record the actor and time; settings, assignments, and status changes also write audit logs.

The dashboard shows the signed-in user's newest unfinished checklist, even when that user is an admin. Only approval of every item completes a checklist. Once complete, the widget advances to the next newest unfinished assignment; completed copies remain accessible in the Completed tab. The widget refreshes after its own changes, on window focus, and every 30 seconds to pick up approvals from other sessions.

## Attachments

PDF, JPEG, PNG, GIF, WebP, Word, Excel, text, and CSV uploads are supported, up to 10 MB per file. Attachments are stored as private PostgreSQL binary data; list/detail responses only include metadata. Downloads require an active session and the same company/assignment authorization as the checklist, and are served as downloads with private/no-store headers. No public upload URLs are created. Include this binary data in database capacity and backup planning. The deployment's request-body limit must allow 10 MB files plus multipart overhead.

## Deployment

Apply `prisma/migrations/20260923120000_add_checklists/migration.sql` through the normal Prisma deployment workflow before running the updated application:

```sh
npx prisma migrate deploy
npx prisma generate
```

The migration is additive: two company settings, a status enum, and five checklist tables with foreign keys and indexes. It does not modify existing business records. The feature must then be enabled in Settings by an admin.

## Integration tests

`src/__tests__/checklists/checklists.integration.test.ts` runs the real route handlers and Prisma queries against an isolated PostgreSQL database, with mocked authentication. It covers tenant boundaries, role and assignee access, independent snapshots, template reuse, status transitions, private uploads/downloads, dashboard ordering, archival, and disabling/re-enabling the feature.

Use a disposable **local** database named `carebase_checklists_test` (or a name beginning with that prefix), initialized with the current Prisma schema. Never point this suite at a shared or production database. The suite skips unless the test URL is provided and refuses non-local database hosts.

```sh
CHECKLIST_TEST_DATABASE_URL='postgresql://postgres@127.0.0.1:55439/carebase_checklists_test' \
  npm test -- --runInBand src/__tests__/checklists/checklists.integration.test.ts
```
