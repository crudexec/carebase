/** @jest-environment node */

import { PrismaClient, UserRole } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import * as intakeDetail from "@/app/api/intake/[id]/route";
import * as intakeForms from "@/app/api/intake/[id]/forms/route";
import * as clientForms from "@/app/api/client-forms/route";

jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/db", () => {
  const { PrismaClient } = jest.requireActual("@prisma/client");
  return {
    prisma: new PrismaClient({
      datasourceUrl:
        process.env.INTAKE_FORMS_TEST_DATABASE_URL ||
        "postgresql://invalid/disabled",
    }),
  };
});

const testUrl = process.env.INTAKE_FORMS_TEST_DATABASE_URL;
const suite = testUrl ? describe : describe.skip;
const req = (body: unknown, method = "PUT", path = "/api/intake/x/forms") =>
  new Request(`http://localhost${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
const login = (user: { id: string; companyId: string; role: UserRole }) =>
  (auth as jest.Mock).mockResolvedValue({ user });

let companyId: string;
let otherCompanyId: string;
let admin: { id: string; companyId: string; role: UserRole };
let otherAdmin: typeof admin;
let clientId: string;
let otherClientId: string;
let intakeId: string;
let otherClientIntakeId: string;
let consentTemplateId: string;
let rightsTemplateId: string;
let disabledTemplateId: string;
let visitNoteTemplateId: string;
let foreignTemplateId: string;

suite("Intake consent forms with an isolated PostgreSQL database", () => {
  beforeAll(async () => {
    const url = new URL(testUrl!);
    if (
      !["localhost", "127.0.0.1"].includes(url.hostname) ||
      !url.pathname.startsWith("/carebase_intake_forms_test")
    )
      throw new Error(
        "Intake form tests require a dedicated local carebase_intake_forms_test database",
      );

    companyId = (await prisma.company.create({ data: { name: "Intake forms test" } })).id;
    otherCompanyId = (await prisma.company.create({ data: { name: "Other intake tenant" } })).id;

    const createUser = (name: string, tenant: string) =>
      prisma.user.create({
        data: {
          email: `${name}-${tenant}@example.test`,
          passwordHash: "unused",
          firstName: name,
          lastName: "Test",
          role: "ADMIN",
          companyId: tenant,
        },
      });
    [admin, otherAdmin] = await Promise.all([
      createUser("Admin", companyId),
      createUser("OtherAdmin", otherCompanyId),
    ]);

    const createClient = (firstName: string) =>
      prisma.client.create({ data: { firstName, lastName: "Client", companyId } });
    clientId = (await createClient("Ada")).id;
    otherClientId = (await createClient("Ben")).id;

    const createIntake = (client: string, number: string) =>
      prisma.intake.create({
        data: { intakeNumber: `INT-TEST-${number}-${companyId}`, companyId, clientId: client },
      });
    intakeId = (await createIntake(clientId, "1")).id;
    otherClientIntakeId = (await createIntake(otherClientId, "2")).id;

    const createTemplate = (
      name: string,
      overrides: Partial<{ type: "CLIENT_FORM" | "VISIT_NOTE"; isEnabled: boolean; companyId: string; createdById: string }> = {},
    ) =>
      prisma.formTemplate.create({
        data: {
          name,
          type: "CLIENT_FORM",
          status: "ACTIVE",
          isEnabled: true,
          companyId,
          createdById: admin.id,
          ...overrides,
          sections: {
            create: [
              {
                title: "Consent",
                order: 0,
                fields: {
                  create: [{ label: "Notes", type: "TEXT_SHORT", required: false, order: 0 }],
                },
              },
            ],
          },
        },
      });
    consentTemplateId = (await createTemplate("General Consent")).id;
    rightsTemplateId = (await createTemplate("Client Rights")).id;
    disabledTemplateId = (await createTemplate("Disabled Form", { isEnabled: false })).id;
    visitNoteTemplateId = (await createTemplate("Visit Note", { type: "VISIT_NOTE" })).id;
    foreignTemplateId = (
      await createTemplate("Foreign Form", { companyId: otherCompanyId, createdById: otherAdmin.id })
    ).id;
  });

  afterAll(async () => {
    if (companyId && otherCompanyId) {
      const tenants = { in: [companyId, otherCompanyId] };
      await prisma.clientFormSubmission.deleteMany({ where: { companyId: tenants } });
      await prisma.intake.deleteMany({ where: { companyId: tenants } });
      await prisma.formTemplate.deleteMany({ where: { companyId: tenants } });
      await prisma.client.deleteMany({ where: { companyId: tenants } });
      await prisma.auditLog.deleteMany({ where: { companyId: tenants } });
      await prisma.user.deleteMany({ where: { companyId: tenants } });
      await prisma.company.deleteMany({ where: { id: tenants } });
    }
    await (prisma as PrismaClient).$disconnect();
  });

  const getIntake = async () => {
    const response = await intakeDetail.GET(new Request(`http://localhost/api/intake/${intakeId}`), ctx(intakeId));
    expect(response.status).toBe(200);
    return response.json();
  };

  test("requires authentication and a same-company intake", async () => {
    (auth as jest.Mock).mockResolvedValue(null);
    expect((await intakeForms.PUT(req({ templateIds: [] }), ctx(intakeId))).status).toBe(401);

    login(otherAdmin);
    expect((await intakeForms.PUT(req({ templateIds: [] }), ctx(intakeId))).status).toBe(404);
  });

  test("only enabled client forms from the company can be selected", async () => {
    login(admin);
    for (const templateId of [disabledTemplateId, visitNoteTemplateId, foreignTemplateId]) {
      const response = await intakeForms.PUT(req({ templateIds: [templateId] }), ctx(intakeId));
      expect(response.status).toBe(400);
    }
    expect(await prisma.intakeForm.count({ where: { intakeId } })).toBe(0);
  });

  test("lists enabled client forms and saves the selection", async () => {
    login(admin);
    const before = await getIntake();
    expect(before.availableConsentForms.map((t: { name: string }) => t.name).sort()).toEqual([
      "Client Rights",
      "General Consent",
    ]);
    expect(before.consentForms).toEqual([]);

    const response = await intakeForms.PUT(
      req({ templateIds: [consentTemplateId, rightsTemplateId, consentTemplateId] }),
      ctx(intakeId),
    );
    expect(response.status).toBe(200);

    const after = await getIntake();
    expect(after.consentForms).toHaveLength(2);
    expect(after.consentForms.every((form: { submission: unknown }) => form.submission === null)).toBe(true);
  });

  test("links staff submissions to the intake and keeps submitted forms selected", async () => {
    login(admin);
    const submit = await clientForms.POST(
      req({ clientId, templateId: consentTemplateId, intakeId, data: {} }, "POST", "/api/client-forms"),
    );
    expect(submit.status).toBe(201);
    const { submission } = await submit.json();

    const intake = await getIntake();
    const consent = intake.consentForms.find(
      (form: { template: { id: string } }) => form.template.id === consentTemplateId,
    );
    expect(consent.submission.id).toBe(submission.id);

    const removeSubmitted = await intakeForms.PUT(req({ templateIds: [rightsTemplateId] }), ctx(intakeId));
    expect(removeSubmitted.status).toBe(400);

    const removePending = await intakeForms.PUT(req({ templateIds: [consentTemplateId] }), ctx(intakeId));
    expect(removePending.status).toBe(200);
    expect(
      (await prisma.intakeForm.findMany({ where: { intakeId } })).map((form) => form.templateId),
    ).toEqual([consentTemplateId]);
  });

  test("rejects a submission for an intake that belongs to another client", async () => {
    login(admin);
    const response = await clientForms.POST(
      req(
        { clientId, templateId: rightsTemplateId, intakeId: otherClientIntakeId, data: {} },
        "POST",
        "/api/client-forms",
      ),
    );
    expect(response.status).toBe(404);
    expect(await prisma.clientFormSubmission.count({ where: { intakeId: otherClientIntakeId } })).toBe(0);
  });
});
