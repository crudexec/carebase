import { readFileSync } from "node:fs";
import path from "node:path";
import { render } from "@testing-library/react";
import { FormRenderer } from "@/components/visit-notes/form-renderer";
import type { FormTemplateData } from "@/lib/visit-notes/types";

interface DraftField {
  label: string;
  type: string;
  config: { content?: string; columns?: { label: string }[]; options?: string[] };
}

const draft = JSON.parse(
  readFileSync(path.join(process.cwd(), "docs/template-drafts/joolie-intake-forms.json"), "utf8"),
);

const plainText = (htmlContent: string) => {
  const element = document.createElement("div");
  element.innerHTML = htmlContent;
  return (element.textContent ?? "").replace(/\s+/g, " ").trim();
};

describe("Joolie intake form drafts render in the client form renderer", () => {
  beforeAll(() => {
    // jsdom has no canvas; signature pads only need a context to exist
    jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  });

  it.each(draft.templates.map((t: { name: string }) => [t.name, t]))("%s", (_name, template) => {
    const withIds = {
      ...(template as FormTemplateData),
      id: "review-only",
      sections: (template as FormTemplateData).sections.map((section, s) => ({
        ...section,
        id: `section-${s}`,
        fields: section.fields.map((field, f) => ({ ...field, id: `section-${s}-field-${f}` })),
      })),
    } as FormTemplateData;

    const { container } = render(<FormRenderer template={withIds} onSubmit={jest.fn()} />);
    const rendered = (container.textContent ?? "").replace(/\s+/g, " ");

    for (const section of withIds.sections) {
      expect(rendered).toContain(section.title);
      for (const field of section.fields as unknown as DraftField[]) {
        if (field.type === "TEXT_DISPLAY") {
          // Legal text must survive the renderer's HTML sanitizer intact
          expect(rendered).toContain(plainText(field.config.content ?? ""));
        } else {
          expect(rendered).toContain(field.label);
        }
        for (const column of field.config.columns ?? []) expect(rendered).toContain(column.label);
        for (const option of field.type.endsWith("CHOICE") ? field.config.options ?? [] : []) {
          expect(rendered).toContain(option);
        }
      }
    }
  });
});
