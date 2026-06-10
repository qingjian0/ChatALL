const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

export function escapeHtml(input) {
  if (typeof input !== 'string') {
    return input;
  }
  return input.replace(/[&<>"'`=\/]/g, (char) => HTML_ESCAPE_MAP[char] || char);
}

export function sanitizeInput(input) {
  if (input === null || input === undefined) {
    return '';
  }
  
  if (typeof input === 'string') {
    return escapeHtml(input).trim();
  }
  
  if (typeof input === 'object') {
    if (Array.isArray(input)) {
      return input.map((item) => sanitizeInput(item));
    }
    const sanitized = {};
    for (const key of Object.keys(input)) {
      sanitized[key] = sanitizeInput(input[key]);
    }
    return sanitized;
  }
  
  return input;
}

export function sanitizeHtml(html) {
  if (typeof html !== 'string') {
    return '';
  }
  
  const allowedTags = [
    'b', 'strong', 'i', 'em', 'u', 's', 'strike', 'sub', 'sup',
    'p', 'br', 'div', 'span',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'a', 'img',
    'code', 'pre', 'blockquote',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ];
  
  const allowedAttributes = ['href', 'src', 'alt', 'title', 'class', 'target', 'rel'];
  
  let result = html;
  
  result = result.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  result = result.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  result = result.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '');
  result = result.replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '');
  result = result.replace(/<embed[^>]*>[\s\S]*?<\/embed>/gi, '');
  result = result.replace(/<applet[^>]*>[\s\S]*?<\/applet>/gi, '');
  
  result = result.replace(
    /<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/gi,
    (match, closingSlash, tagName, attributes) => {
      const lowerTagName = tagName.toLowerCase();
      
      if (!allowedTags.includes(lowerTagName)) {
        return escapeHtml(match);
      }
      
      let cleanedAttributes = '';
      const attrRegex = /([a-zA-Z][a-zA-Z0-9_-]*)\s*=\s*["']([^"']*)["']/gi;
      let attrMatch;
      
      while ((attrMatch = attrRegex.exec(attributes)) !== null) {
        const attrName = attrMatch[1].toLowerCase();
        let attrValue = attrMatch[2];
        
        if (allowedAttributes.includes(attrName)) {
          if (attrName === 'href' || attrName === 'src') {
            try {
              const url = new URL(attrValue);
              if (!['http:', 'https:', 'data:'].includes(url.protocol)) {
                continue;
              }
              if (attrName === 'href') {
                attrValue = url.toString();
              }
            } catch {
              continue;
            }
          }
          if (attrName === 'target') {
            attrValue = '_blank';
          }
          if (attrName === 'rel' && attrValue === '') {
            attrValue = 'noopener noreferrer';
          }
          cleanedAttributes += ` ${attrName}="${escapeHtml(attrValue)}"`;
        }
      }
      
      return `<${closingSlash}${lowerTagName}${cleanedAttributes}>`;
    }
  );
  
  return result;
}

export function validateUrl(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateApiKey(apiKey) {
  if (typeof apiKey !== 'string') {
    return false;
  }
  const trimmed = apiKey.trim();
  return trimmed.length > 0 && trimmed.length <= 512;
}

export function stripXSS(input) {
  if (typeof input !== 'string') {
    return input;
  }
  
  const patterns = [
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,
    /data:image\/svg\+xml[^>]*>/gi,
  ];
  
  let result = input;
  for (const pattern of patterns) {
    result = result.replace(pattern, '');
  }
  
  return result;
}
