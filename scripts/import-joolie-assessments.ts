/**
 * Default: validate the assessments review draft locally; no database connection.
 * After explicit user approval only:
 * DATABASE_URL=... node --import tsx scripts/import-joolie-assessments.ts
 *   --apply --company-id=<approved company> --created-by-id=<approved user>
 *   --approved-sha256=<hash of approved draft>
 * Creates each assessment template inactive (the app's draft state). Never updates an
 * existing template; any name clash aborts the whole import.
 */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { AssessmentResponseType, AssessmentSectionType, Prisma, PrismaClient } from "@prisma/client";
import { z } from "zod";
import { hasPermission, PERMISSIONS } from "../src/lib/permissions";
import { createAssessmentTemplateSchema, validateAssessmentTemplate } from "../src/lib/assessments/validation";

const file = new URL("../docs/template-drafts/joolie-assessments.json", import.meta.url);
const raw = readFileSync(file, "utf8");
// Response types the assessment renderer handles and that score as intended
const supported = new Set<AssessmentResponseType>(["SINGLE_CHOICE", "TEXT_SHORT", "TEXT_LONG", "DATE", "SIGNATURE"]);

const draftSchema = z.object({
  source: z.object({ file: z.string(), sha256: z.string().length(64) }),
  company: z.object({ name: z.literal("Joolie Health"), adminEmail: z.string().email() }),
  openItems: z.array(z.string()),
  textChanges: z.array(z.object({ template: z.string(), from: z.string(), to: z.string(), reason: z.string() }).strict()),
  templates: z.array(z.unknown()).min(1),
}).strict();

const draft = draftSchema.parse(JSON.parse(raw));
const digest = createHash("sha256").update(raw).digest("hex");
const sourceDigest = createHash("sha256")
  .update(readFileSync(new URL(`../${draft.source.file}`, import.meta.url)))
  .digest("hex");
if (sourceDigest !== draft.source.sha256) throw Error("Source document changed since the draft was built");

const templates = draft.templates.map((t, i) => {
  const check = validateAssessmentTemplate(t);
  if (!check.valid) throw Error(`Template ${i + 1}: ${check.errors.join("; ")}`);
  return createAssessmentTemplateSchema.parse(t);
});

const names = templates.map(t => t.name.toLowerCase());
if (new Set(names).size !== names.length) throw Error("Duplicate template names");
for (const template of templates) {
  let scoredItems = 0;
  for (const section of template.sections) {
    let sectionScored = 0;
    for (const item of section.items) {
      const where = `${template.name} / ${section.title} / ${item.questionText}`;
      if (!supported.has(item.responseType)) throw Error(`Unsupported response type ${item.responseType}: ${where}`);
      if (item.scoreMapping || item.showIf) throw Error(`scoreMapping/showIf not used by this import: ${where}`);
      const scores = (item.responseOptions ?? []).map(o => o.score ?? 0);
      if (scores.some(s => s !== 0 && s !== 1)) throw Error(`Scores must be 0 or 1: ${where}`);
      if (scores.includes(1)) {
        // Exactly one answer marks the risk/hazard
        if (scores.filter(s => s === 1).length !== 1) throw Error(`Scored item needs exactly one scoring answer: ${where}`);
        sectionScored++;
      }
    }
    if ((section.scoringConfig?.maxScore ?? 0) !== sectionScored) throw Error(`Section max score mismatch: ${template.name} / ${section.title}`);
    scoredItems += sectionScored;
  }
  if (template.scoringConfig.method !== "SUM" || template.scoringConfig.maxScore !== scoredItems) {
    throw Error(`Template max score must equal its scored items (${scoredItems}): ${template.name}`);
  }
}

const itemCount = (t: (typeof templates)[number]) => t.sections.reduce((n, s) => n + s.items.length, 0);
const summary = {
  sha256: digest,
  sourceSha256: draft.source.sha256,
  templates: templates.map(t => ({ name: t.name, sections: t.sections.length, items: itemCount(t), maxScore: t.scoringConfig.maxScore })),
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
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${companyId}), hashtext('joolie-assessments'))`;
      const company = await tx.company.findUnique({ where: { id: companyId }, select: { name: true, isActive: true } });
      if (!company?.isActive || company.name !== draft.company.name) throw Error("Company must be the active Joolie Health tenant");
      const creator = await tx.user.findFirst({ where: { id: createdById, companyId }, select: { id: true, role: true, email: true } });
      if (!creator || creator.email.toLowerCase() !== draft.company.adminEmail || !hasPermission(creator.role, PERMISSIONS.ASSESSMENT_TEMPLATE_MANAGE)) {
        throw Error("Creator must be the Joolie Health admin with assessment template permission");
      }
      const duplicates = await tx.assessmentTemplate.findMany({
        where: { companyId, OR: templates.map(t => ({ name: { equals: t.name, mode: "insensitive" as const } })) },
        select: { name: true },
      });
      if (duplicates.length) throw Error(`Templates already exist (${duplicates.map(d => d.name).join(", ")}); refusing to overwrite`);

      const created = [];
      for (const template of templates) {
        const record = await tx.assessmentTemplate.create({
          data: {
            name: template.name, description: template.description ?? null, isRequired: template.isRequired,
            isActive: false, scoringMethod: template.scoringConfig.method,
            maxScore: template.scoringConfig.maxScore ?? null, companyId,
            sections: { create: template.sections.map(s => ({
              sectionType: s.sectionType as AssessmentSectionType, title: s.title,
              description: s.description ?? null, instructions: s.instructions ?? null, displayOrder: s.order,
              scoringMethod: s.scoringConfig?.method ?? null, maxScore: s.scoringConfig?.maxScore ?? null,
              items: { create: s.items.map(item => ({
                code: item.code, question: item.questionText, description: item.description ?? null,
                responseType: item.responseType, displayOrder: item.order, isRequired: item.required,
                responseOptions: (item.responseOptions ?? Prisma.DbNull) as Prisma.InputJsonValue,
              })) },
            })) },
          },
          include: { sections: { include: { items: true } } },
        });
        const storedItems = record.sections.reduce((n, s) => n + s.items.length, 0);
        if (record.sections.length !== template.sections.length || storedItems !== itemCount(template)) {
          throw Error(`Stored counts differ from reviewed draft: ${template.name}`);
        }
        await tx.auditLog.create({ data: {
          companyId, userId: createdById, action: "ASSESSMENT_TEMPLATE_CREATED",
          entityType: "AssessmentTemplate", entityId: record.id,
          changes: { name: record.name, isActive: false, sectionCount: record.sections.length, itemCount: storedItems, maxScore: template.scoringConfig.maxScore ?? null, sourceSha256: digest },
        } });
        created.push({ id: record.id, name: record.name, sections: record.sections.length, items: storedItems });
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
