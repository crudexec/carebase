const ALLOWED_TAGS = new Set([
  "p", "br", "strong", "b", "em", "i", "u", "s", "ul", "ol", "li",
  "h1", "h2", "h3", "blockquote", "a", "hr",
]);

/** Keep offer-letter markup intentionally small and remove executable HTML. */
export function sanitizeOfferHtml(input: string): string {
  return input
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe|object|embed|svg|math|form|textarea|input|button)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<(script|style|iframe|object|embed|svg|math|form|textarea|input|button)\b[^>]*\/?>/gi, "")
    .replace(/<\/?([a-z][a-z0-9-]*)\b([^>]*)>/gi, (whole, rawName: string, rawAttrs: string) => {
      const name = rawName.toLowerCase();
      if (!ALLOWED_TAGS.has(name)) return "";
      if (whole.startsWith("</")) return name === "br" || name === "hr" ? "" : `</${name}>`;
      if (name === "br" || name === "hr") return `<${name}>`;
      if (name !== "a") return `<${name}>`;

      const href = rawAttrs.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
      const value = (href?.[1] ?? href?.[2] ?? href?.[3] ?? "").trim();
      if (!/^(https?:\/\/|mailto:|#)/i.test(value)) return "<a>";
      const escaped = value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
      return `<a href="${escaped}">`;
    })
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s+(?:href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\1/gi, "");
}

export function offerBodyToEditorHtml(value: string): string {
  if (/<\/?(?:p|br|strong|b|em|i|u|s|ul|ol|li|h[1-3]|blockquote|a|hr)\b[^>]*>/i.test(value)) return sanitizeOfferHtml(value);
  return value
    .split(/\n\s*\n/)
    .map((paragraph) => `<p>${escapeText(paragraph).replace(/\n/g, "<br>") || "<br>"}</p>`)
    .join("");
}

function escapeText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
