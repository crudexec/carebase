import { HelpArticle, helpCategories } from "@/content/help";

export interface SearchResult {
  article: HelpArticle;
  score: number;
  excerpt: string;
  matchedIn: ("title" | "description" | "keywords" | "content")[];
}

/**
 * Search help articles by query string
 * Returns results sorted by relevance score
 */
export function searchHelpArticles(
  query: string,
  articles: HelpArticle[]
): SearchResult[] {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery.split(/\s+/);
  const results: SearchResult[] = [];

  for (const article of articles) {
    let score = 0;
    const matchedIn: ("title" | "description" | "keywords" | "content")[] = [];

    // Title match (highest weight)
    const titleLower = article.title.toLowerCase();
    if (titleLower.includes(normalizedQuery)) {
      score += 100;
      matchedIn.push("title");
    } else if (queryWords.some((word) => titleLower.includes(word))) {
      score += 50;
      matchedIn.push("title");
    }

    // Description match
    const descLower = article.description.toLowerCase();
    if (descLower.includes(normalizedQuery)) {
      score += 60;
      matchedIn.push("description");
    } else if (queryWords.some((word) => descLower.includes(word))) {
      score += 30;
      matchedIn.push("description");
    }

    // Keywords match
    const keywordsLower = article.keywords.map((k) => k.toLowerCase());
    if (keywordsLower.some((k) => k.includes(normalizedQuery))) {
      score += 80;
      matchedIn.push("keywords");
    } else if (queryWords.some((word) => keywordsLower.some((k) => k.includes(word)))) {
      score += 40;
      matchedIn.push("keywords");
    }

    // Content match (lowest weight but still important)
    const contentLower = article.content.toLowerCase();
    if (contentLower.includes(normalizedQuery)) {
      score += 20;
      matchedIn.push("content");
    } else if (queryWords.some((word) => contentLower.includes(word))) {
      score += 10;
      matchedIn.push("content");
    }

    if (score > 0) {
      const excerpt = generateExcerpt(article.content, normalizedQuery, queryWords);
      results.push({ article, score, excerpt, matchedIn });
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Generate an excerpt from content showing the matched text
 */
function generateExcerpt(
  content: string,
  query: string,
  queryWords: string[]
): string {
  // Remove markdown formatting
  const plainText = content
    .replace(/#{1,6}\s/g, "") // Remove headings
    .replace(/\*\*([^*]+)\*\*/g, "$1") // Remove bold
    .replace(/\*([^*]+)\*/g, "$1") // Remove italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links
    .replace(/`([^`]+)`/g, "$1") // Remove inline code
    .replace(/\n+/g, " ") // Replace newlines with spaces
    .replace(/\s+/g, " ") // Collapse whitespace
    .trim();

  const lowerText = plainText.toLowerCase();
  const excerptLength = 150;

  // Try to find the exact query first
  let index = lowerText.indexOf(query);

  // If not found, try to find any word
  if (index === -1) {
    for (const word of queryWords) {
      index = lowerText.indexOf(word);
      if (index !== -1) break;
    }
  }

  if (index === -1) {
    // No match found, return beginning of content
    return plainText.slice(0, excerptLength) + (plainText.length > excerptLength ? "..." : "");
  }

  // Calculate start and end positions for excerpt
  const start = Math.max(0, index - 50);
  const end = Math.min(plainText.length, index + excerptLength);

  let excerpt = plainText.slice(start, end);

  // Add ellipsis if needed
  if (start > 0) excerpt = "..." + excerpt;
  if (end < plainText.length) excerpt = excerpt + "...";

  return excerpt;
}

/**
 * Highlight search terms in text
 */
export function highlightSearchTerms(text: string, query: string): string {
  if (!query || query.trim().length < 2) return text;

  const queryWords = query.toLowerCase().trim().split(/\s+/);
  let result = text;

  for (const word of queryWords) {
    const regex = new RegExp(`(${escapeRegExp(word)})`, "gi");
    result = result.replace(regex, "<mark>$1</mark>");
  }

  return result;
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Get category title for an article
 */
export function getCategoryTitle(categorySlug: string): string {
  const category = helpCategories.find((c) => c.slug === categorySlug);
  return category?.title || categorySlug;
}
