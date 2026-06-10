export const CSP_POLICY = {
  development: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      'http://localhost:8098',
    ],
    'style-src': ["'self'", "'unsafe-inline'"],
    'connect-src': ["'self'", 'https://*'],
    'img-src': ["'self'", 'data:', 'https://*'],
    'font-src': ["'self'"],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  },
  production: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      'https://static.geetest.com',
      'https://matomo.chatall.ai',
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'",
      'https://fonts.googleapis.com',
    ],
    'connect-src': [
      "'self'",
      'https://api.openai.com',
      'https://api.anthropic.com',
      'https://generativelanguage.googleapis.com',
      'https://api.cohere.ai',
      'https://api.groq.com',
      'https://api.x.ai',
      'https://api.deepseek.com',
      'https://api.moonshot.cn',
      'https://api.doubao.com',
      'https://spark-api.xfyun.cn',
      'https://api.minimax.chat',
      'https://dashscope.aliyuncs.com',
      'https://qianwen.aliyun.com',
      'https://matomo.chatall.ai',
      'wss://*',
    ],
    'img-src': [
      "'self'",
      'data:',
      'https://*',
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
    ],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'upgrade-insecure-requests': [],
  },
};

export function buildCSPHeader(env = 'production') {
  const policy = CSP_POLICY[env] || CSP_POLICY.production;
  return Object.entries(policy)
    .map(([directive, values]) => {
      if (values.length === 0) {
        return directive;
      }
      return `${directive} ${values.join(' ')}`;
    })
    .join('; ');
}

export const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': [
    'accelerometer=()',
    'ambient-light-sensor=()',
    'autoplay=()',
    'battery=()',
    'camera=()',
    'clipboard-read=()',
    'clipboard-write=()',
    'display-capture=()',
    'document-domain=()',
    'encrypted-media=()',
    'fullscreen=()',
    'gamepad=()',
    'geolocation=()',
    'gyroscope=()',
    'layout-animations=(self)',
    'legacy-image-formats=(self)',
    'magnetometer=()',
    'microphone=()',
    'midi=()',
    'navigation-override=()',
    'oversized-images=(self)',
    'payment=()',
    'picture-in-picture=()',
    'publickey-credentials-get=()',
    'screen-wake-lock=()',
    'sync-xhr=(self)',
    'unoptimized-images=(self)',
    'unsized-media=(self)',
    'usb=()',
    'web-share=()',
    'xr-spatial-tracking=()',
  ].join(', '),
};
