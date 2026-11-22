import DOMPurify from "isomorphic-dompurify";

const allowedTags = ["p", "br", "strong", "em", "ul", "ol", "li"];

export function sanitizeScreenHtml(html: string): string {
	return DOMPurify.sanitize(html, {
		ALLOWED_TAGS: allowedTags,
		ALLOWED_ATTR: [],
		ALLOW_DATA_ATTR: false,
		ALLOW_ARIA_ATTR: false,
	});
}
