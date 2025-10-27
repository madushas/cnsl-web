import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize HTML input to prevent XSS attacks
 * @param dirty - Potentially unsafe HTML string
 * @param allowedTags - Optional array of allowed HTML tags
 * @returns Sanitized string safe for rendering
 */
export function sanitizeHtml(dirty: string, allowedTags?: string[]): string {
  if (!dirty || typeof dirty !== "string") return "";

  const config = allowedTags
    ? { ALLOWED_TAGS: allowedTags }
    : {
        // Default: strip all HTML tags
        ALLOWED_TAGS: [],
        KEEP_CONTENT: true, // Keep text content, remove tags
      };

  return DOMPurify.sanitize(dirty, config);
}

/**
 * Sanitize plain text input (removes all HTML)
 * @param text - User input text
 * @returns Plain text with HTML stripped
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== "string") return "";
  return sanitizeHtml(text);
}

/**
 * Sanitize markdown-safe HTML (allows basic formatting)
 * @param html - HTML content from markdown or rich text editor
 * @returns Sanitized HTML safe for display
 */
export function sanitizeMarkdown(html: string): string {
  if (!html || typeof html !== "string") return "";

  const allowedTags = [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "s",
    "code",
    "pre",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "blockquote",
    "a",
    "img",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
  ];

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: ["href", "src", "alt", "title", "class"],
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
}

/**
 * Validate and sanitize email
 * @param email - Email address
 * @returns Sanitized email or empty string if invalid
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== "string") return "";

  const cleaned = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(cleaned)) return "";

  // Additional XSS protection
  return sanitizeText(cleaned);
}

/**
 * Validate and sanitize URL
 * @param url - URL string
 * @param allowedProtocols - Allowed protocols (default: http, https)
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(
  url: string,
  allowedProtocols: string[] = ["http:", "https:"],
): string {
  if (!url || typeof url !== "string") return "";

  try {
    const parsed = new URL(url);

    if (!allowedProtocols.includes(parsed.protocol)) {
      return "";
    }

    return parsed.toString();
  } catch {
    return "";
  }
}

/**
 * Sanitize phone number (keeps only digits, +, -, spaces, parentheses)
 * @param phone - Phone number
 * @returns Cleaned phone number
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== "string") return "";

  // Allow only phone-safe characters
  return phone.replace(/[^0-9+\-\s()]/g, "").trim();
}
