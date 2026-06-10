const ALLOWED_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:']
const SUSPICIOUS_PATTERNS = [
  /javascript:/gi,
  /data:/gi,
  /vbscript:/gi,
  /on\w+\s*=/gi,
  /<script/gi,
  /<\/script/gi,
  /&#x[0-9a-f]+;/gi,
]

export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '#'
  
  try {
    const trimmed = url.trim()
    
    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.test(trimmed)) {
        return '#'
      }
    }
    
    const urlObj = new URL(trimmed, window.location.origin)
    
    if (!ALLOWED_PROTOCOLS.includes(urlObj.protocol)) {
      return '#'
    }
    
    return urlObj.href
  } catch (e) {
    return '#'
  }
}

export function validateUrl(url) {
  if (!url || typeof url !== 'string') return false
  
  try {
    const urlObj = new URL(url, window.location.origin)
    return ALLOWED_PROTOCOLS.includes(urlObj.protocol)
  } catch (e) {
    return false
  }
}

export function isInternalUrl(url) {
  if (!url) return false
  try {
    const urlObj = new URL(url, window.location.origin)
    return urlObj.origin === window.location.origin
  } catch (e) {
    return false
  }
}

export function escapeHtml(text) {
  if (text == null) return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function encodeUrl(url) {
  try {
    return encodeURI(url)
  } catch (e) {
    return url
  }
}

export default {
  sanitizeUrl,
  validateUrl,
  isInternalUrl,
  escapeHtml,
  encodeUrl,
}
