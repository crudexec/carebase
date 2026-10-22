import { readFileSync } from "node:fs";
import path from "node:path";
import { render } from "@testing-library/react";
import { AssessmentRenderer } from "@/components/assessments/assessment-renderer";
import { calculateAssessmentScore } from "@/lib/assessments/validation";

interface DraftItem {
  code: string;
  questionText: string;
  description: string | null;
  responseType: "SINGLE_CHOICE" | "TEXT_SHORT" | "TEXT_LONG" | "DATE" | "SIGNATURE";
  required: boolean;
  order: number;
  responseOptions?: { value: string; label: string; score: number }[];
}
interface DraftSection {
  sectionType: string;
  title: string;
  description: string | null;
  order: number;
  items: DraftItem[];
}
interface DraftTemplate {
  name: string;
  description: string;
  scoringConfig: { method: "SUM"; maxScore: number };
  sections: DraftSection[];
}

const draft = JSON.parse(
  readFileSync(path.join(process.cwd(), "docs/template-drafts/joolie-assessments.json"), "utf8"),
) as { templates: DraftTemplate[] };

const items = (template: DraftTemplate) =>
  template.sections.flatMap((section) =>
    section.items.map((item) => ({ ...item, id: `${section.order}-${item.code}` })),
  );

// Answers as the assessment API stores them: choice values as text, other fields as text/data URLs
const answer = (item: ReturnType<typeof items>[number], pickRisk: boolean) => {
  if (item.responseType !== "SINGLE_CHOICE") {
    return { itemId: item.id, value: item.responseType === "DATE" ? "2026-10-21" : "Recorded value" };
  }
  const options = item.responseOptions ?? [];
  const risky = options.find((o) => o.score === 1);
  const chosen = pickRisk ? risky ?? options[0] : options.find((o) => o.score === 0) ?? options[0];
  return { itemId: item.id, value: chosen.value };
};

const score = (template: DraftTemplate, pickRisk: boolean) => {
  const all = items(template);
  return calculateAssessmentScore(
    all.map((item) => answer(item, pickRisk)),
    all.map((item) => ({ id: item.id, responseType: item.responseType, scoreMapping: null, responseOptions: item.responseOptions ?? null })),
    "SUM",
  ).totalScore;
};

describe("Joolie assessment drafts", () => {
  beforeAll(() => {
    // jsdom has no canvas; signature pads only need a context to exist
    jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    // jsdom does not implement element scrolling
    Element.prototype.scrollTo = jest.fn();
  });

  it.each(draft.templates.map((t) => [t.name, t] as const))("%s scores from 0 to its maximum", (_name, template) => {
    expect(score(template, false)).toBe(0);
    expect(score(template, true)).toBe(template.scoringConfig.maxScore);
  });

  it("scores the reversed home safety questions on a Yes answer", () => {
    const safety = draft.templates.find((t) => t.name.startsWith("Home Safety"))!;
    const all = items(safety);
    const clutter = all.find((i) => i.questionText === "Is there clutter on the floor?")!;
    const grabBars = all.find((i) => i.questionText.startsWith("Are there grab bars"))!;
    const food = all.find((i) => i.questionText === "Is food prepared in the kitchen?")!;
    const scored = (itemId: string, value: string, item: typeof clutter) =>
      calculateAssessmentScore([{ itemId, value }], [{ id: item.id, responseType: item.responseType, scoreMapping: null, responseOptions: item.responseOptions ?? null }], "SUM").totalScore;

    expect(scored(clutter.id, "YES", clutter)).toBe(1);
    expect(scored(clutter.id, "NO", clutter)).toBe(0);
    expect(scored(grabBars.id, "NO", grabBars)).toBe(1);
    expect(scored(grabBars.id, "YES", grabBars)).toBe(0);
    expect(scored(food.id, "YES", food) + scored(food.id, "NO", food)).toBe(0);
  });

  it.each(draft.templates.map((t) => [t.name, t] as const))("%s renders every section in the assessment renderer", (_name, template) => {
    for (const section of template.sections) {
      // The renderer shows one section at a time, so render each section on its own
      const single = {
        id: "review-only",
        name: template.name,
        description: template.description,
        maxScore: template.scoringConfig.maxScore,
        sections: [{
          id: `section-${section.order}`,
          title: section.title,
          description: section.description,
          sectionType: section.sectionType,
          displayOrder: 0,
          items: section.items.map((item) => ({
            id: `${section.order}-${item.code}`,
            code: item.code,
            question: item.questionText,
            description: item.description,
            responseType: item.responseType,
            responseOptions: item.responseOptions ?? null,
            minValue: null,
            maxValue: null,
            isRequired: item.required,
            displayOrder: item.order,
          })),
        }],
      };
      const { container, unmount } = render(<AssessmentRenderer template={single} responses={[]} />);
      const text = (container.textContent ?? "").replace(/\s+/g, " ");
      expect(text).toContain(section.title);
      // Answering guidance lives in section descriptions, which the renderer displays
      if (section.description) expect(text).toContain(section.description);
      for (const item of section.items) {
        if (item.description) expect(text).toContain(item.description);
        expect(text).toContain(item.questionText);
        for (const option of item.responseOptions ?? []) expect(text).toContain(option.label);
      }
      unmount();
    }
  });
});
