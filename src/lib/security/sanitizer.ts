// Simple HTML sanitizer for server-side use (no heavy dependencies)
const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'em', 'u', 'b', 'i',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote',
  'a', 'img', 'figure', 'figcaption',
  'table', 'thead', 'tbody', 'tr', 'td', 'th',
  'div', 'span', 'iframe', 'hr'
]);

const ALLOWED_ATTRS = new Set([
  'href', 'title', 'alt', 'src', 'width', 'height',
  'class', 'id', 'target', 'rel', 'style',
  'frameborder', 'allowfullscreen'
]);

export function sanitizeHTML(dirty: string): string {
  if (!dirty) return '';

  // Remove script tags and their contents
  let clean = dirty.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  clean = clean.replace(/<script[^>]*\/>/gi, '');

  // Remove event handlers (onclick, onload, etc.)
  clean = clean.replace(/\son\w+=["'][^"']*["']/gi, '');
  clean = clean.replace(/\son\w+=[^\s>]+/gi, '');

  // Remove javascript: URLs
  clean = clean.replace(/javascript:/gi, '');

  // Remove data: URLs except for images
  clean = clean.replace(/data:(?!image\/)/gi, '');

  // Parse and filter tags
  return clean.replace(/<\/?([\w-]+)([^>]*)>/g, (match, tagName, attrs) => {
    const lowerTag = tagName.toLowerCase();

    if (!ALLOWED_TAGS.has(lowerTag)) {
      return '';
    }

    // For closing tags, just return as-is for allowed tags
    if (match.startsWith('</')) {
      return match.toLowerCase();
    }

    // Filter attributes
    const filteredAttrs = attrs.replace(/\s*(\w+)(?:=["']([^"']*)["']|=[^\s>]+|(?=[\s>]))/g, (attrMatch: string, attrName: string, attrValue?: string) => {
      const lowerAttr = attrName.toLowerCase();
      if (!ALLOWED_ATTRS.has(lowerAttr)) {
        return '';
      }
      // Sanitize href/src values
      if ((lowerAttr === 'href' || lowerAttr === 'src') && attrValue) {
        const val = attrValue.toLowerCase().trim();
        if (val.startsWith('javascript:') || val.startsWith('data:') || val.startsWith('vbscript:')) {
          return '';
        }
      }
      return attrMatch;
    });

    return `<${lowerTag}${filteredAttrs}>`;
  });
}

export function sanitizeText(dirty: string): string {
  if (!dirty) return '';
  // Strip all HTML tags
  return dirty.replace(/<[^>]+>/g, '').trim();
}
