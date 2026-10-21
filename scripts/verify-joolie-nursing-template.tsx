/** Render every section with the actual care-plan components, without a database. */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { CarePlanRenderer } from '../src/components/care-plans/care-plan-renderer';
import { FormFieldType } from '@prisma/client';

const draft = JSON.parse(readFileSync(new URL('../docs/template-drafts/joolie-comprehensive-nursing-template.json', import.meta.url), 'utf8'));
const coverage = JSON.parse(readFileSync(new URL('../docs/template-drafts/joolie-patient-information-coverage.json', import.meta.url), 'utf8'));
assert.equal(coverage.requirements.length, 37, 'Preserve all 37 patient-information requirement groups');
for (const requirement of coverage.requirements) {
  assert.ok(requirement.inScope && requirement.implemented, `Unimplemented requirement: ${requirement.sourceRequirement}`);
  assert.ok(requirement.templateFields?.length, `No field mapping: ${requirement.sourceRequirement}`);
  for (const mapping of requirement.templateFields) {
    const section = draft.sections.find((s: { title: string }) => s.title === mapping.section);
    assert.ok(section?.fields.some((f: { label: string }) => f.label === mapping.field), `Missing mapped field: ${mapping.section} / ${mapping.field}`);
  }
}
let renderedFields = 0;
for (const [sectionIndex, section] of draft.sections.entries()) {
  const fields = section.fields.map((field: Record<string, unknown>, index: number) => ({ ...field, id: `section-${sectionIndex}-field-${index}` }));
  const data: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.type === 'NUMBER') data[field.id] = 0;
    if (field.type === 'REPEATABLE_GROUP') {
      data[field.id] = [Object.fromEntries(field.config.childFields.map((child: { key: string; type: FormFieldType; config: { options?: string[] } }) => [child.key, child.type === 'NUMBER' ? 0 : child.type === 'SINGLE_CHOICE' ? child.config.options?.[0] : '']))];
    }
  }
  const props = { template: { ...draft, id: 'review-only', sections: [{ ...section, id: `section-${sectionIndex}`, fields }] }, formData: data } as Parameters<typeof CarePlanRenderer>[0];
  const markup = renderToStaticMarkup(<CarePlanRenderer {...props} />);
  for (const field of fields) {
    const label = renderToStaticMarkup(<span>{field.label}</span>).slice(6, -7);
    assert.ok(markup.includes(label), `Missing field label ${section.title} / ${field.label}`);
    if (field.type === 'BODY_MAP') assert.ok(markup.includes('<svg'), 'Body map SVG must render');
    for (const child of field.config.childFields ?? []) {
      const childLabel = renderToStaticMarkup(<span>{child.label}</span>).slice(6, -7);
      assert.ok(markup.includes(childLabel), `Missing repeated child ${child.label}`);
    }
  }
  if (fields.some((f: { type: string }) => f.type === 'NUMBER')) assert.ok(markup.includes('value="0"'), 'Numeric zero must remain visible');
  renderedFields += fields.length;
}
console.log(`PASS: all 37 patient-information requirement groups map to template fields. ${draft.sections.length} sections and ${renderedFields} top-level fields render; repeatable child fields, body-map SVGs and numeric zero values verified. No database connection.`);
