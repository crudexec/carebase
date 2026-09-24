/** @jest-environment node */

import { PrismaClient, UserRole } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import * as settings from "@/app/api/settings/checklists/route";
import * as templates from "@/app/api/checklists/templates/route";
import * as checklists from "@/app/api/checklists/route";
import * as detail from "@/app/api/checklists/[id]/route";
import * as items from "@/app/api/checklists/items/[id]/route";
import * as comments from "@/app/api/checklists/items/[id]/comments/route";
import * as uploads from "@/app/api/checklists/items/[id]/attachments/route";
import * as downloads from "@/app/api/checklists/attachments/[id]/route";

jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/db", () => {
  const { PrismaClient } = jest.requireActual("@prisma/client");
  return {
    prisma: new PrismaClient({
      datasourceUrl:
        process.env.CHECKLIST_TEST_DATABASE_URL ||
        "postgresql://invalid/disabled",
    }),
  };
});

const testUrl = process.env.CHECKLIST_TEST_DATABASE_URL;
const suite = testUrl ? describe : describe.skip;
const req = (body: unknown, method = "POST", path = "/api/checklists") =>
  new Request(`http://localhost${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
const get = (path = "/api/checklists") =>
  new Request(`http://localhost${path}`);
const login = (user: { id: string; companyId: string; role: UserRole }) =>
  (auth as jest.Mock).mockResolvedValue({ user });
let companyId: string;
let otherCompanyId: string;
let admin: { id: string; companyId: string; role: UserRole };
let alice: typeof admin;
let bob: typeof admin;
let outsider: typeof admin;
let otherAdmin: typeof admin;
let templateId: string;
let aliceCopy: string;
let bobCopy: string;
let aliceItem: string;
let fileId: string;

suite("Checklists API with an isolated PostgreSQL database", () => {
  beforeAll(async () => {
    const url = new URL(testUrl!);
    if (
      !["localhost", "127.0.0.1"].includes(url.hostname) ||
      !url.pathname.startsWith("/carebase_checklists_test")
    )
      throw new Error(
        "Checklist tests require a dedicated local carebase_checklists_test database",
      );
    companyId = (
      await prisma.company.create({
        data: {
          name: "Checklist integration test",
          checklistsEnabled: true,
          checklistsDashboardVisible: true,
        },
      })
    ).id;
    otherCompanyId = (
      await prisma.company.create({
        data: { name: "Other checklist tenant", checklistsEnabled: true },
      })
    ).id;
    const createUser = (name: string, role: UserRole, tenant = companyId) =>
      prisma.user.create({
        data: {
          email: `${name}-${companyId}@example.test`,
          passwordHash: "unused",
          firstName: name,
          lastName: "Test",
          role,
          companyId: tenant,
        },
      });
    [admin, alice, bob, outsider, otherAdmin] = await Promise.all([
      createUser("Admin", "ADMIN"),
      createUser("Alice", "CARER"),
      createUser("Bob", "STAFF"),
      createUser("Outsider", "CARER"),
      createUser("OtherAdmin", "ADMIN", otherCompanyId),
    ]);
  });
  afterAll(async () => {
    if (companyId && otherCompanyId) {
      await prisma.checklist.deleteMany({
        where: { companyId: { in: [companyId, otherCompanyId] } },
      });
      await prisma.checklistTemplate.deleteMany({
        where: { companyId: { in: [companyId, otherCompanyId] } },
      });
      await prisma.auditLog.deleteMany({
        where: { companyId: { in: [companyId, otherCompanyId] } },
      });
      await prisma.user.deleteMany({
        where: { companyId: { in: [companyId, otherCompanyId] } },
      });
      await prisma.company.deleteMany({
        where: { id: { in: [companyId, otherCompanyId] } },
      });
    }
    await (prisma as PrismaClient).$disconnect();
  });

  test("requires authentication and admin privileges for settings and templates", async () => {
    (auth as jest.Mock).mockResolvedValue(null);
    expect((await checklists.GET(get())).status).toBe(401);
    login(alice);
    expect(
      (
        await settings.PATCH(
          req(
            { checklistsEnabled: true, checklistsDashboardVisible: true },
            "PATCH",
          ),
        )
      ).status,
    ).toBe(403);
    expect(
      (await templates.POST(req({ title: "No", items: ["No"] }))).status,
    ).toBe(403);
    expect((await templates.GET()).status).toBe(403);
    expect(
      (
        await checklists.POST(
          req({ templateId: "anything", assigneeIds: [alice.id] }),
        )
      ).status,
    ).toBe(403);
  });

  test("validates templates and settings and creates a reusable template", async () => {
    login(admin);
    expect(
      (
        await settings.PATCH(
          req(
            { checklistsEnabled: "yes", checklistsDashboardVisible: true },
            "PATCH",
          ),
        )
      ).status,
    ).toBe(400);
    expect(
      (await templates.POST(req({ title: " ", items: [" "] }))).status,
    ).toBe(400);
    expect(
      (await templates.POST(req({ title: "Empty", items: [] }))).status,
    ).toBe(400);
    const result = await templates.POST(
      req({
        title: "Onboarding",
        description: "Welcome",
        items: ["Read handbook", "Upload certificate"],
      }),
    );
    expect(result.status).toBe(201);
    templateId = (await result.json()).template.id;
  });

  test("rejects cross-company and inactive assignees without creating partial copies", async () => {
    login(admin);
    expect(
      (
        await checklists.POST(
          req({ templateId, assigneeIds: [alice.id, otherAdmin.id] }),
        )
      ).status,
    ).toBe(400);
    await prisma.user.update({
      where: { id: bob.id },
      data: { isActive: false },
    });
    expect(
      (
        await checklists.POST(
          req({ templateId, assigneeIds: [alice.id, bob.id] }),
        )
      ).status,
    ).toBe(400);
    expect(await prisma.checklist.count({ where: { templateId } })).toBe(0);
    await prisma.user.update({
      where: { id: bob.id },
      data: { isActive: true },
    });
    login(otherAdmin);
    expect(
      (await checklists.POST(req({ templateId, assigneeIds: [otherAdmin.id] })))
        .status,
    ).toBe(404);
    expect(
      (await templates.PATCH(req({ id: templateId, archived: true }, "PATCH")))
        .status,
    ).toBe(404);
  });

  test("assigns independent snapshots and keeps them unchanged after editing the template", async () => {
    login(admin);
    const response = await checklists.POST(
      req({ templateId, assigneeIds: [alice.id, bob.id, alice.id] }),
    );
    expect(response.status).toBe(201);
    expect((await response.json()).checklists).toHaveLength(2);
    const copies = await prisma.checklist.findMany({
      where: { templateId },
      include: { items: { orderBy: { position: "asc" } } },
    });
    aliceCopy = copies.find((c) => c.assigneeId === alice.id)!.id;
    bobCopy = copies.find((c) => c.assigneeId === bob.id)!.id;
    aliceItem = copies.find((c) => c.assigneeId === alice.id)!.items[0].id;
    expect(
      (
        await templates.PATCH(
          req(
            {
              id: templateId,
              title: "Updated onboarding",
              items: ["New item"],
            },
            "PATCH",
          ),
        )
      ).status,
    ).toBe(200);
    const snapshot = await prisma.checklist.findUniqueOrThrow({
      where: { id: aliceCopy },
      include: { items: true },
    });
    expect(snapshot.title).toBe("Onboarding");
    expect(snapshot.items).toHaveLength(2);
  });

  test("hides other users' copies, comments, and tenant data", async () => {
    login(alice);
    const own = await (await checklists.GET(get())).json();
    expect(own.checklists.map((c: { id: string }) => c.id)).toEqual([
      aliceCopy,
    ]);
    expect((await detail.GET(get(), ctx(bobCopy))).status).toBe(404);
    login(outsider);
    expect((await detail.GET(get(), ctx(aliceCopy))).status).toBe(404);
    expect(
      (await comments.POST(req({ body: "No access" }), ctx(aliceItem))).status,
    ).toBe(404);
    expect(
      (await items.PATCH(req({ action: "submit" }, "PATCH"), ctx(aliceItem)))
        .status,
    ).toBe(404);
    login(otherAdmin);
    expect((await detail.GET(get(), ctx(aliceCopy))).status).toBe(404);
  });

  test("lets the assigned user submit, blocks self-approval, and preserves independent progress", async () => {
    login(alice);
    expect(
      (await items.PATCH(req({ action: "submit" }, "PATCH"), ctx(aliceItem)))
        .status,
    ).toBe(200);
    expect(
      (await items.PATCH(req({ action: "approve" }, "PATCH"), ctx(aliceItem)))
        .status,
    ).toBe(403);
    expect(
      (await items.PATCH(req({ action: "reopen" }, "PATCH"), ctx(aliceItem)))
        .status,
    ).toBe(403);
    expect(
      (await items.PATCH(req({ action: "submit" }, "PATCH"), ctx(aliceItem)))
        .status,
    ).toBe(409);
    expect(
      (
        await prisma.checklistItem.findUniqueOrThrow({
          where: { id: aliceItem },
        })
      ).status,
    ).toBe("SUBMITTED");
    expect(
      await prisma.checklistItem.count({
        where: { checklistId: bobCopy, status: "PENDING" },
      }),
    ).toBe(2);
  });

  test("supports comments by the assigned user and admin only", async () => {
    login(alice);
    expect(
      (await comments.POST(req({ body: " " }), ctx(aliceItem))).status,
    ).toBe(400);
    expect(
      (await comments.POST(req({ body: "Handbook read." }), ctx(aliceItem)))
        .status,
    ).toBe(201);
    login(admin);
    expect(
      (await comments.POST(req({ body: "Thanks!" }), ctx(aliceItem))).status,
    ).toBe(201);
    const data = await (await detail.GET(get(), ctx(aliceCopy))).json();
    expect(data.checklist.items[0].comments).toHaveLength(2);
  });

  test("stores private attachments, validates files, and protects downloads", async () => {
    const upload = (name: string, type: string, content: string) => {
      const form = new FormData();
      form.append("file", new File([content], name, { type }));
      return new Request("http://localhost/api/checklists/upload", {
        method: "POST",
        body: form,
      });
    };
    login(alice);
    expect(
      (
        await uploads.POST(
          upload("unsafe.html", "text/html", "<script>bad()</script>"),
          ctx(aliceItem),
        )
      ).status,
    ).toBe(400);
    expect(
      (
        await uploads.POST(
          upload("empty.txt", "text/plain", ""),
          ctx(aliceItem),
        )
      ).status,
    ).toBe(400);
    const oversized = new Request("http://localhost/upload", {
      method: "POST",
      headers: { "content-length": String(11 * 1024 * 1024) },
    });
    expect((await uploads.POST(oversized, ctx(aliceItem))).status).toBe(413);
    const response = await uploads.POST(
      upload("evidence.txt", "text/plain", "Certificate evidence"),
      ctx(aliceItem),
    );
    expect(response.status).toBe(201);
    const result = await response.json();
    fileId = result.attachment.id;
    expect(result.attachment.data).toBeUndefined();
    const download = await downloads.GET(get(), ctx(fileId));
    expect(await download.text()).toBe("Certificate evidence");
    expect(download.headers.get("content-disposition")).toContain(
      "attachment;",
    );
    login(admin);
    expect((await downloads.GET(get(), ctx(fileId))).status).toBe(200);
    expect(
      (
        await uploads.POST(
          upload("admin-note.txt", "text/plain", "Reviewed"),
          ctx(aliceItem),
        )
      ).status,
    ).toBe(201);
    login(bob);
    expect((await downloads.GET(get(), ctx(fileId))).status).toBe(404);
    expect(
      (await uploads.POST(upload("no.txt", "text/plain", "No"), ctx(aliceItem)))
        .status,
    ).toBe(404);
    login(otherAdmin);
    expect((await downloads.GET(get(), ctx(fileId))).status).toBe(404);
  });

  test("requires submission before admin approval and allows returning and reopening items", async () => {
    login(admin);
    const pending = await prisma.checklistItem.findFirstOrThrow({
      where: { checklistId: aliceCopy, status: "PENDING" },
    });
    expect(
      (await items.PATCH(req({ action: "approve" }, "PATCH"), ctx(pending.id)))
        .status,
    ).toBe(409);
    expect(
      (await items.PATCH(req({ action: "uncheck" }, "PATCH"), ctx(aliceItem)))
        .status,
    ).toBe(200);
    login(alice);
    expect(
      (await items.PATCH(req({ action: "submit" }, "PATCH"), ctx(aliceItem)))
        .status,
    ).toBe(200);
    login(admin);
    expect(
      (await items.PATCH(req({ action: "approve" }, "PATCH"), ctx(aliceItem)))
        .status,
    ).toBe(200);
    login(alice);
    expect(
      (await items.PATCH(req({ action: "uncheck" }, "PATCH"), ctx(aliceItem)))
        .status,
    ).toBe(409);
    login(admin);
    expect(
      (await items.PATCH(req({ action: "reopen" }, "PATCH"), ctx(aliceItem)))
        .status,
    ).toBe(200);
    const reopened = await prisma.checklistItem.findUniqueOrThrow({
      where: { id: aliceItem },
    });
    expect(reopened.status).toBe("PENDING");
    expect(reopened.approvedAt).toBeNull();
    expect(reopened.approvedById).toBeNull();
  });

  test("shows the latest unfinished assignment and advances only after every item is approved", async () => {
    login(admin);
    await templates.PATCH(
      req({ id: templateId, items: ["Item one", "Item two"] }, "PATCH"),
    );
    const fresh = await (
      await checklists.POST(req({ templateId, assigneeIds: [alice.id] }))
    ).json();
    const latestId = fresh.checklists[0].id;
    login(alice);
    const widget = () =>
      checklists.GET(get("/api/checklists?widget=true")).then((r) => r.json());
    expect((await widget()).checklist.id).toBe(latestId);
    const latestItems = await prisma.checklistItem.findMany({
      where: { checklistId: latestId },
    });
    for (const item of latestItems)
      expect(
        (await items.PATCH(req({ action: "submit" }, "PATCH"), ctx(item.id)))
          .status,
      ).toBe(200);
    expect((await widget()).checklist.id).toBe(latestId);
    login(admin);
    await items.PATCH(
      req({ action: "approve" }, "PATCH"),
      ctx(latestItems[0].id),
    );
    login(alice);
    expect((await widget()).checklist.id).toBe(latestId);
    login(admin);
    await items.PATCH(
      req({ action: "approve" }, "PATCH"),
      ctx(latestItems[1].id),
    );
    login(alice);
    expect((await widget()).checklist.id).toBe(aliceCopy);
    const completed = await (
      await checklists.GET(get("/api/checklists?status=completed"))
    ).json();
    expect(completed.checklists.map((c: { id: string }) => c.id)).toEqual([
      latestId,
    ]);
    login(admin);
    expect((await widget()).checklist).toBeNull(); // Admin dashboard is still their own queue.
  });

  test("archives templates without affecting copies and independently controls dashboard visibility", async () => {
    login(admin);
    expect(
      (await templates.PATCH(req({ id: templateId, archived: true }, "PATCH")))
        .status,
    ).toBe(200);
    expect(
      (await checklists.POST(req({ templateId, assigneeIds: [alice.id] })))
        .status,
    ).toBe(404);
    expect((await detail.GET(get(), ctx(aliceCopy))).status).toBe(200);
    expect(
      (
        await settings.PATCH(
          req(
            { checklistsEnabled: true, checklistsDashboardVisible: false },
            "PATCH",
          ),
        )
      ).status,
    ).toBe(200);
    login(alice);
    expect(
      (await (await checklists.GET(get("/api/checklists?widget=true"))).json())
        .visible,
    ).toBe(false);
    expect((await detail.GET(get(), ctx(aliceCopy))).status).toBe(200);
    login(admin);
    await settings.PATCH(
      req(
        { checklistsEnabled: false, checklistsDashboardVisible: true },
        "PATCH",
      ),
    );
    login(alice);
    expect((await checklists.GET(get())).status).toBe(403);
    expect(
      (await comments.POST(req({ body: "Blocked" }), ctx(aliceItem))).status,
    ).toBe(403);
    expect((await downloads.GET(get(), ctx(fileId))).status).toBe(403);
    login(admin);
    expect(
      (
        await settings.PATCH(
          req(
            { checklistsEnabled: true, checklistsDashboardVisible: true },
            "PATCH",
          ),
        )
      ).status,
    ).toBe(200);
    expect((await detail.GET(get(), ctx(aliceCopy))).status).toBe(200);
  });
});
