import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize untrusted HTML content to prevent XSS.
 * Use this before rendering any user-generated content (chat, descriptions, etc).
 */
export function sanitize(content: string): string {
  if (!content) return "";

  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      "b",
      "i",
      "em",
      "strong",
      "a",
      "p",
      "br",
      "ul",
      "ol",
      "li",
      "span",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "code",
      "pre",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class"],
  });
}

/**
 * Strip all HTML tags to get plain text.
 */
export function stripHtml(content: string): string {
  if (!content) return "";
  return content.replace(/<[^>]*>?/gm, "");
}
