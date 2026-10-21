/**
 * Default: validate the review draft locally; no database connection.
 * After explicit user approval only:
 * DATABASE_URL=... node --import tsx scripts/import-joolie-nursing-template.ts 
 *   --apply --company-id=<approved company> --created-by-id=<approved user> 
 *   --approved-sha256=<hash of approved draft>
 * Optional --activate publishes/enables the NEW template; default is draft/disabled.
 * Never updates an existing template or patient record.
 */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { Prisma, PrismaClient, FormFieldType } from "@prisma/client";
import { z } from "zod";
import { hasPermission, PERMISSIONS } from "../src/lib/permissions";

const file = new URL("../docs/template-drafts/joolie-comprehensive-nursing-template.json", import.meta.url);
const raw = readFileSync(file, "utf8");
const supported = new Set([
  "TEXT_SHORT", "TEXT_LONG", "NUMBER", "YES_NO", "SINGLE_CHOICE",
  "MULTIPLE_CHOICE", "DATE", "TIME", "SIGNATURE", "BODY_MAP", "REPEATABLE_GROUP", "ICD10_DIAGNOSIS",
]);
const childSupported = new Set(["TEXT_SHORT", "TEXT_LONG", "NUMBER", "DATE", "SINGLE_CHOICE"]);
const configSchema = z.record(z.string(), z.unknown());
const fieldSchema = z.object({
  label: z.string().min(1), type: z.nativeEnum(FormFieldType),
  required: z.boolean(), order: z.number().int().nonnegative(), config: configSchema,
}).strict();
const sectionSchema = z.object({
  title: z.string().min(1), description: z.string().nullable(),
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
const template = templateSchema.parse(JSON.parse(raw));
const digest = createHash("sha256").update(raw).digest("hex");

function checkField(f: { label: string; type: string; config: Record<string, unknown> }, child = false) {
  if (!(child ? childSupported : supported).has(f.type)) throw Error(`Unsupported renderer type: ${f.type}`);
  if (f.type.endsWith("CHOICE")) {
    const opts = z.array(z.string().min(1)).min(1).parse(f.config.options);
    if (new Set(opts).size !== opts.length) throw Error(`Duplicate choices: ${f.label}`);
  }
  if (f.type === "NUMBER") {
    const bounds = z.object({ min: z.number(), max: z.number().optional() }).parse(f.config);
    if (bounds.max !== undefined && bounds.min > bounds.max) throw Error(`Invalid numeric bounds: ${f.label}`);
  }
  if (f.type === "REPEATABLE_GROUP") {
    const cfg = z.object({
      childFields: z.array(childSchema).min(1), minItems: z.literal(0),
      maxItems: z.number().int().positive().optional(), itemLabel: z.string().min(1),
      addButtonLabel: z.string().min(1), collapsible: z.boolean(),
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
  name: template.name, sha256: digest, sections: template.sections.length,
  fields: template.sections.reduce((n, s) => n + s.fields.length, 0),
  bodyMaps: template.sections.flatMap(s => s.fields).filter(f => f.type === "BODY_MAP").length,
};

async function main() {
  const args = process.argv.slice(2);
  for (const arg of args) {
    if (!/^(--apply|--activate|--company-id=.+|--created-by-id=.+|--approved-sha256=.+)$/.test(arg)) throw Error(`Unknown argument: ${arg}`);
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
  const activate = args.includes("--activate");
  const prisma = new PrismaClient();
  try {
    const result = await prisma.$transaction(async tx => {
      // Serialize concurrent runs for this company/name; do not mutate existing templates.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${companyId}), hashtext(${template.name}))`;
      const company = await tx.company.findUnique({ where: { id: companyId }, select: { name: true, isActive: true } });
      if (!company?.isActive || company.name !== "Joolie Health") throw Error("Company must be the active Joolie Health tenant");
      const creator = await tx.user.findFirst({ where: { id: createdById, companyId }, select: { id: true, role: true } });
      if (!creator || !hasPermission(creator.role, PERMISSIONS.CARE_PLAN_MANAGE)) throw Error("Creator must belong to Joolie Health and have care-plan management permission");
      const duplicate = await tx.carePlanTemplate.findFirst({ where: { companyId, name: { equals: template.name, mode: "insensitive" } }, select: { id: true } });
      if (duplicate) throw Error(`Template already exists (${duplicate.id}); refusing to overwrite`);
      const created = await tx.carePlanTemplate.create({
        data: {
          name: template.name, description: template.description, version: 1,
          companyId, createdById, status: activate ? "ACTIVE" : "DRAFT", isEnabled: activate,
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
