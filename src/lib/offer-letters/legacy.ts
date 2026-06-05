const LEGACY_OFFER_TAG_LINES = [
  /We are pleased to offer you the position of\s*\{offer\.position\}\s*with\s*\{company\.name\}\./g,
  /Start Date:\s*\{offer\.startDate\}/g,
  /Pay Rate:\s*\{offer\.payRate\}/g,
  /Employment Type:\s*\{offer\.employmentType\}/g,
  /\{offer\.managerName\}/g,
];

export function removeLegacyOfferDetailTags(bodyHtml: string): string {
  return LEGACY_OFFER_TAG_LINES.reduce(
    (body, pattern) => body.replace(pattern, ""),
    bodyHtml
  )
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
