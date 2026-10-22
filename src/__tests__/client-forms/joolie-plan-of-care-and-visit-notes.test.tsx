import { readFileSync } from "node:fs";
import path from "node:path";
import { render } from "@testing-library/react";
import { FormRenderer } from "@/components/visit-notes/form-renderer";
import { CarePlanRenderer } from "@/components/care-plans/care-plan-renderer";
import type { FormTemplateData } from "@/lib/visit-notes/types";

interface DraftField {
  label: string;
  type: string;
  config: {
    content?: string;
    options?: string[];
    columns?: { label: string }[];
    childFields?: { label: string; config: { options?: string[] } }[];
  };
}
interface DraftSection {
  title: string;
  description: string | null;
  fields: DraftField[];
}

const load = (name: string) =>
  JSON.parse(readFileSync(path.join(process.cwd(), "docs/template-drafts", name), "utf8"));
const visitNotes = load("joolie-visit-notes.json");
const planOfCare = load("joolie-plan-of-care-485.json").templates[0];

const plainText = (htmlContent: string) => {
  const element = document.createElement("div");
  element.innerHTML = htmlContent;
  return (element.textContent ?? "").replace(/\s+/g, " ").trim();
};
const flat = (container: HTMLElement) => (container.textContent ?? "").replace(/\s+/g, " ");

const expectSection = (text: string, section: DraftSection) => {
  expect(text).toContain(section.title);
  if (section.description) expect(text).toContain(section.description);
  for (const field of section.fields) {
    if (field.type === "TEXT_DISPLAY") expect(text).toContain(plainText(field.config.content ?? ""));
    else expect(text).toContain(field.label);
    for (const column of field.config.columns ?? []) expect(text).toContain(column.label);
    for (const option of field.type.endsWith("CHOICE") ? field.config.options ?? [] : []) expect(text).toContain(option);
  }
};

const withIds = (template: { sections: DraftSection[] }) => ({
  ...template,
  id: "review-only",
  sections: template.sections.map((section, s) => ({
    ...section,
    id: `section-${s}`,
    fields: section.fields.map((field, f) => ({ ...field, id: `section-${s}-field-${f}` })),
  })),
});

describe("Joolie visit-note and plan-of-care drafts", () => {
  beforeAll(() => {
    // jsdom has no canvas or element scrolling
    jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    Element.prototype.scrollTo = jest.fn();
  });

  it.each(visitNotes.templates.map((t: { name: string }) => [t.name, t]))(
    "%s renders in the visit-note form renderer",
    (_name, template) => {
      const { container } = render(
        <FormRenderer template={withIds(template as { sections: DraftSection[] }) as unknown as FormTemplateData} onSubmit={jest.fn()} />,
      );
      for (const section of (template as { sections: DraftSection[] }).sections) expectSection(flat(container), section);
    },
  );

  it("CMS-485 renders every section in the care plan renderer", () => {
    const full = withIds(planOfCare);
    full.sections.forEach((section, index) => {
      // One repeatable item per group so its child fields render
      const formData = Object.fromEntries(
        section.fields
          .filter((field) => field.type === "REPEATABLE_GROUP")
          .map((field) => [field.id, [{}]]),
      );
      const props = {
        template: { ...full, sections: [section] },
        formData,
      } as unknown as Parameters<typeof CarePlanRenderer>[0];
      const { container, unmount } = render(<CarePlanRenderer {...props} />);
      const text = flat(container);
      expectSection(text, planOfCare.sections[index]);
      for (const field of section.fields) {
        for (const child of field.config.childFields ?? []) {
          expect(text).toContain(child.label);
          for (const option of child.config.options ?? []) expect(text).toContain(option);
        }
      }
      unmount();
    });
  });
});
