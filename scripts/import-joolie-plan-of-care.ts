/**
 * Default: validate the CMS-485 plan-of-care review draft locally; no database connection.
 * After explicit user approval only:
 * DATABASE_URL=... node --import tsx scripts/import-joolie-plan-of-care.ts
 *   --apply --company-id=<approved company> --created-by-id=<approved user>
 *   --approved-sha256=<hash of approved draft>
 * Creates the care plan template as DRAFT/disabled. Never updates an existing template.
 */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { Prisma, PrismaClient, FormFieldType } from "@prisma/client";
import { z } from "zod";
import { hasPermission, PERMISSIONS } from "../src/lib/permissions";
import { validateFieldConfig } from "../src/lib/visit-notes/validation";

const file = new URL("../docs/template-drafts/joolie-plan-of-care-485.json", import.meta.url);
const raw = readFileSync(file, "utf8");
// Field types the care plan renderer can display
const supported = new Set([
  "TEXT_SHORT", "TEXT_LONG", "DATE", "SIGNATURE", "SINGLE_CHOICE",
  "MULTIPLE_CHOICE", "ICD10_DIAGNOSIS", "REPEATABLE_GROUP",
]);
const childSupported = new Set(["TEXT_SHORT", "TEXT_LONG", "NUMBER", "DATE", "SINGLE_CHOICE"]);

const configSchema = z.record(z.string(), z.unknown());
const fieldSchema = z.object({
  label: z.string().min(1).max(200), type: z.nativeEnum(FormFieldType),
  required: z.boolean(), order: z.number().int().nonnegative(), config: configSchema,
}).strict();
const sectionSchema = z.object({
  title: z.string().min(1).max(200), description: z.string().nullable(),
  order: z.number().int().nonnegative(), fields: z.array(fieldSchema).min(1),
}).strict();
const templateSchema = z.object({
  name: z.string().min(1).max(200), description: z.string().max(1000),
  status: z.literal("DRAFT"), isEnabled: z.literal(false), version: z.literal(1),
  sections: z.array(sectionSchema).min(1),
}).strict();
const childSchema = z.object({
  key: z.string().min(1), label: z.string().min(1), type: z.nativeEnum(FormFieldType),
  required: z.boolean(), config: configSchema,
}).strict();
const draftSchema = z.object({
  source: z.object({ file: z.string(), sha256: z.string().length(64) }),
  company: z.object({ name: z.literal("Joolie Health"), adminEmail: z.string().email() }),
  openItems: z.array(z.string()),
  textChanges: z.array(z.object({ template: z.string(), from: z.string(), to: z.string(), reason: z.string() }).strict()),
  templates: z.array(templateSchema).length(1),
}).strict();

const draft = draftSchema.parse(JSON.parse(raw));
const template = draft.templates[0];
const digest = createHash("sha256").update(raw).digest("hex");
const sourceDigest = createHash("sha256")
  .update(readFileSync(new URL(`../${draft.source.file}`, import.meta.url)))
  .digest("hex");
if (sourceDigest !== draft.source.sha256) throw Error("Source document changed since the draft was built");

function checkField(f: { label: string; type: string; config: Record<string, unknown> }, child = false) {
  if (!(child ? childSupported : supported).has(f.type)) throw Error(`Unsupported renderer type ${f.type}: ${f.label}`);
  const check = validateFieldConfig(f.type as FormFieldType, f.config);
  if (!check.valid) throw Error(`${check.error}: ${f.label}`);
  if (f.type.endsWith("CHOICE")) {
    const opts = f.config.options as string[];
    if (new Set(opts).size !== opts.length) throw Error(`Duplicate choices: ${f.label}`);
  }
  if (f.type === "REPEATABLE_GROUP") {
    const cfg = z.object({
      childFields: z.array(childSchema).min(1), minItems: z.literal(0),
      itemLabel: z.string().min(1), addButtonLabel: z.string().min(1), collapsible: z.boolean(),
    }).strict().parse(f.config);
    if (new Set(cfg.childFields.map(c => c.key)).size !== cfg.childFields.length) throw Error(`Duplicate child keys: ${f.label}`);
    cfg.childFields.forEach(c => checkField(c, true));
  }
}
if (new Set(template.sections.map(s => s.title)).size !== template.sections.length) throw Error("Duplicate sections");
template.sections.forEach((s, i) => {
  if (s.order !== i) throw Error(`Invalid section order: ${s.title}`);
  if (new Set(s.fields.map(f => f.label)).size !== s.fields.length) throw Error(`Duplicate labels: ${s.title}`);
  s.fields.forEach((f, j) => {
    if (f.order !== j) throw Error(`Invalid field order: ${f.label}`);
    checkField(f);
  });
});
const summary = {
  name: template.name, sha256: digest, sourceSha256: draft.source.sha256,
  sections: template.sections.length,
  fields: template.sections.reduce((n, s) => n + s.fields.length, 0),
  textChanges: draft.textChanges.length,
};

async function main() {
  const args = process.argv.slice(2);
  for (const arg of args) {
    if (!/^(--apply|--company-id=.+|--created-by-id=.+|--approved-sha256=.+)$/.test(arg)) throw Error(`Unknown argument: ${arg}`);
  }
  if (!args.includes("--apply")) {
    console.log(JSON.stringify({ mode: "LOCAL VALIDATION ONLY — no database connection", ...summary }, null, 2));
    return;
  }
  const value = (key: string) => args.find(a => a.startsWith(`--${key}=`))?.slice(key.length + 3);
  const companyId = value("company-id");
  const createdById = value("created-by-id");
  if (!companyId || !createdById || !process.env.DATABASE_URL) throw Error("Apply requires explicit company, creator and DATABASE_URL");
  if (value("approved-sha256") !== digest) throw Error("Apply requires --approved-sha256 matching the reviewed draft");
  const prisma = new PrismaClient();
  try {
    const result = await prisma.$transaction(async tx => {
      // Serialize concurrent runs for this company/name; do not mutate existing templates.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${companyId}), hashtext(${template.name}))`;
      const company = await tx.company.findUnique({ where: { id: companyId }, select: { name: true, isActive: true } });
      if (!company?.isActive || company.name !== draft.company.name) throw Error("Company must be the active Joolie Health tenant");
      const creator = await tx.user.findFirst({ where: { id: createdById, companyId }, select: { id: true, role: true, email: true } });
      if (!creator || creator.email.toLowerCase() !== draft.company.adminEmail || !hasPermission(creator.role, PERMISSIONS.CARE_PLAN_MANAGE)) {
        throw Error("Creator must be the Joolie Health admin with care-plan management permission");
      }
      const duplicate = await tx.carePlanTemplate.findFirst({ where: { companyId, name: { equals: template.name, mode: "insensitive" } }, select: { id: true } });
      if (duplicate) throw Error(`Template already exists (${duplicate.id}); refusing to overwrite`);
      const created = await tx.carePlanTemplate.create({
        data: {
          name: template.name, description: template.description, version: 1,
          companyId, createdById, status: "DRAFT", isEnabled: false,
          sections: { create: template.sections.map(s => ({
            title: s.title, description: s.description, order: s.order,
            fields: { create: s.fields.map(f => ({ ...f, config: f.config as Prisma.InputJsonValue })) },
          })) },
        },
        include: { sections: { include: { fields: true } } },
      });
      if (created.sections.length !== summary.sections || created.sections.reduce((n, s) => n + s.fields.length, 0) !== summary.fields) throw Error("Stored counts differ from reviewed draft");
      await tx.auditLog.create({ data: {
        companyId, userId: createdById, action: "CARE_PLAN_TEMPLATE_CREATED",
        entityType: "CarePlanTemplate", entityId: created.id,
        changes: { name: created.name, status: created.status, sectionCount: summary.sections, fieldCount: summary.fields, sourceSha256: digest },
      } });
      return { id: created.id, name: created.name, companyId, status: created.status, isEnabled: created.isEnabled };
    }, { timeout: 60000, maxWait: 10000 });
    console.log(JSON.stringify({ ...result, ...summary }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}
main().catch(error => {
  // Do not dump connection settings or full Prisma error objects.
  console.error(error instanceof Error ? error.message.replace(/postgres(?:ql)?:\/\/[^\s]+/g, "[redacted connection]") : "Import failed");
  process.exitCode = 1;
});
