/**
 * Default: validate the visit-notes review draft locally; no database connection.
 * After explicit user approval only:
 * DATABASE_URL=... node --import tsx scripts/import-joolie-visit-notes.ts
 *   --apply --company-id=<approved company> --created-by-id=<approved user>
 *   --approved-sha256=<hash of approved draft>
 * Creates each template as a DRAFT, disabled VISIT_NOTE. Never updates an existing
 * template; any name clash aborts the whole import.
 */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { Prisma, PrismaClient, FormFieldType } from "@prisma/client";
import { z } from "zod";
import { hasPermission, PERMISSIONS } from "../src/lib/permissions";
import { validateFieldConfig } from "../src/lib/visit-notes/validation";

const file = new URL("../docs/template-drafts/joolie-visit-notes.json", import.meta.url);
const raw = readFileSync(file, "utf8");
// Field types the visit-note form renderer can display and validate
const supported = new Set([
  "TEXT_SHORT", "TEXT_LONG", "TEXT_DISPLAY", "YES_NO", "SINGLE_CHOICE", "MULTIPLE_CHOICE",
  "DATE", "TIME", "NUMBER", "SIGNATURE", "TABLE", "ICD10_DIAGNOSIS",
]);
// Mirrors sanitizeTextDisplayHtml in the form renderer
const allowedTags = new Set(["a", "b", "blockquote", "br", "div", "em", "i", "li", "ol", "p", "strong", "u", "ul"]);

const fieldSchema = z.object({
  label: z.string().min(1).max(200), type: z.nativeEnum(FormFieldType),
  required: z.boolean(), order: z.number().int().nonnegative(),
  config: z.record(z.string(), z.unknown()),
}).strict();
const sectionSchema = z.object({
  title: z.string().min(1).max(200), description: z.string().nullable(),
  order: z.number().int().nonnegative(), fields: z.array(fieldSchema).min(1),
}).strict();
const templateSchema = z.object({
  name: z.string().min(1).max(200), description: z.string().max(1000),
  type: z.literal("VISIT_NOTE"), status: z.literal("DRAFT"), isEnabled: z.literal(false),
  version: z.literal(1), settings: z.null(),
  sections: z.array(sectionSchema).min(1),
}).strict();
const draftSchema = z.object({
  source: z.object({ file: z.string(), sha256: z.string().length(64) }),
  company: z.object({ name: z.literal("Joolie Health"), adminEmail: z.string().email() }),
  openItems: z.array(z.string()),
  textChanges: z.array(z.object({ template: z.string(), from: z.string(), to: z.string(), reason: z.string() }).strict()),
  templates: z.array(templateSchema).min(1),
}).strict();

const draft = draftSchema.parse(JSON.parse(raw));
const digest = createHash("sha256").update(raw).digest("hex");
const sourceDigest = createHash("sha256")
  .update(readFileSync(new URL(`../${draft.source.file}`, import.meta.url)))
  .digest("hex");
if (sourceDigest !== draft.source.sha256) throw Error("Source document changed since the draft was built");

const names = draft.templates.map(t => t.name.toLowerCase());
if (new Set(names).size !== names.length) throw Error("Duplicate template names");
for (const template of draft.templates) {
  if (new Set(template.sections.map(s => s.title)).size !== template.sections.length) throw Error(`Duplicate sections: ${template.name}`);
  if (!template.sections.some(s => s.fields.some(f => f.type === "SIGNATURE" && f.required))) throw Error(`No required signature: ${template.name}`);
  template.sections.forEach((section, i) => {
    if (section.order !== i) throw Error(`Invalid section order: ${template.name} / ${section.title}`);
    if (new Set(section.fields.map(f => f.label)).size !== section.fields.length) throw Error(`Duplicate labels: ${template.name} / ${section.title}`);
    section.fields.forEach((field, j) => {
      const where = `${template.name} / ${section.title} / ${field.label}`;
      if (field.order !== j) throw Error(`Invalid field order: ${where}`);
      if (!supported.has(field.type)) throw Error(`Unsupported renderer type ${field.type}: ${where}`);
      const check = validateFieldConfig(field.type, field.config);
      if (!check.valid) throw Error(`${check.error}: ${where}`);
      if (field.type.endsWith("CHOICE")) {
        const options = field.config.options as string[];
        if (new Set(options).size !== options.length) throw Error(`Duplicate choices: ${where}`);
      }
      if (field.type === "NUMBER" && field.config.thresholdEnabled !== false) throw Error(`Quantities must not raise threshold alerts: ${where}`);
      if (field.type === "TEXT_DISPLAY") {
        const content = String(field.config.content ?? "");
        if (!content.trim()) throw Error(`Empty display text: ${where}`);
        for (const [, tag] of content.matchAll(/<\/?([a-z0-9]+)[^>]*>/gi)) {
          if (!allowedTags.has(tag.toLowerCase())) throw Error(`Display tag <${tag}> would be stripped: ${where}`);
        }
      }
    });
  });
}

const fieldCount = (t: (typeof draft.templates)[number]) => t.sections.reduce((n, s) => n + s.fields.length, 0);
const summary = {
  sha256: digest,
  sourceSha256: draft.source.sha256,
  templates: draft.templates.map(t => ({ name: t.name, sections: t.sections.length, fields: fieldCount(t) })),
  totalFields: draft.templates.reduce((n, t) => n + fieldCount(t), 0),
  textChanges: draft.textChanges.length,
  openItems: draft.openItems.length,
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
      // Serialize concurrent runs for this company; do not mutate existing templates.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${companyId}), hashtext('joolie-visit-notes'))`;
      const company = await tx.company.findUnique({ where: { id: companyId }, select: { name: true, isActive: true } });
      if (!company?.isActive || company.name !== draft.company.name) throw Error("Company must be the active Joolie Health tenant");
      const creator = await tx.user.findFirst({ where: { id: createdById, companyId }, select: { id: true, role: true, email: true } });
      if (!creator || creator.email.toLowerCase() !== draft.company.adminEmail || !hasPermission(creator.role, PERMISSIONS.FORM_TEMPLATE_MANAGE)) {
        throw Error("Creator must be the Joolie Health admin with form template permission");
      }
      const duplicates = await tx.formTemplate.findMany({
        where: { companyId, OR: draft.templates.map(t => ({ name: { equals: t.name, mode: "insensitive" as const } })) },
        select: { name: true },
      });
      if (duplicates.length) throw Error(`Templates already exist (${duplicates.map(d => d.name).join(", ")}); refusing to overwrite`);

      const created = [];
      for (const template of draft.templates) {
        const record = await tx.formTemplate.create({
          data: {
            name: template.name, description: template.description, type: "VISIT_NOTE",
            status: "DRAFT", isEnabled: false, version: 1, companyId, createdById,
            sections: { create: template.sections.map(s => ({
              title: s.title, description: s.description, order: s.order,
              fields: { create: s.fields.map(f => ({ ...f, config: f.config as Prisma.InputJsonValue })) },
            })) },
          },
          include: { sections: { include: { fields: true } } },
        });
        const storedFields = record.sections.reduce((n, s) => n + s.fields.length, 0);
        if (record.sections.length !== template.sections.length || storedFields !== fieldCount(template)) {
          throw Error(`Stored counts differ from reviewed draft: ${template.name}`);
        }
        await tx.auditLog.create({ data: {
          companyId, userId: createdById, action: "FORM_TEMPLATE_CREATED",
          entityType: "FormTemplate", entityId: record.id,
          changes: { name: record.name, type: "VISIT_NOTE", status: "DRAFT", sectionCount: record.sections.length, fieldCount: storedFields, sourceSha256: digest },
        } });
        created.push({ id: record.id, name: record.name, sections: record.sections.length, fields: storedFields });
      }
      return created;
    }, { timeout: 60000, maxWait: 10000 });
    console.log(JSON.stringify({ companyId, created: result, ...summary }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}
main().catch(error => {
  // Do not dump connection settings or full Prisma error objects.
  console.error(error instanceof Error ? error.message.replace(/postgres(?:ql)?:\/\/[^\s]+/g, "[redacted connection]") : "Import failed");
  process.exitCode = 1;
});
