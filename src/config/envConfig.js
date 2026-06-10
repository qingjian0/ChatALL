import { reactive } from 'vue';

const config = reactive({
  version: process.env.VUE_APP_VERSION || '1.0.0',
  name: process.env.VUE_APP_NAME || 'ChatALL',
  description: process.env.VUE_APP_DESCRIPTION || '',
  env: process.env.VUE_APP_ENV || 'development',

  api: {
    baseUrl: process.env.VUE_APP_API_BASE_URL || '',
    timeout: parseInt(process.env.VUE_APP_API_TIMEOUT) || 30000
  },

  security: {
    enabled: process.env.VUE_APP_SECURITY_ENABLED === 'true',
    cors: process.env.VUE_APP_CORS_ENABLED === 'true',
    csp: process.env.VUE_APP_CSP_ENABLED === 'true'
  },

  features: {
    debugMode: process.env.VUE_APP_FEATURE_DEBUG_MODE === 'true',
    loggingVerbose: process.env.VUE_APP_FEATURE_LOGGING_VERBOSE === 'true',
    autoUpdate: process.env.VUE_APP_FEATURE_AUTO_UPDATE === 'true',
    telemetry: process.env.VUE_APP_FEATURE_TELEMETRY === 'true'
  },

  build: {
    date: process.env.VUE_APP_BUILD_DATE || '',
    hash: process.env.VUE_APP_BUILD_HASH || '',
    branch: process.env.VUE_APP_BUILD_BRANCH || ''
  },

  analytics: {
    matomoEnabled: process.env.VUE_APP_MATOMO_ENABLED === 'true',
    matomoUrl: process.env.VUE_APP_MATOMO_URL || '',
    matomoSiteId: process.env.VUE_APP_MATOMO_SITE_ID || ''
  },

  debug: {
    toolsEnabled: process.env.VUE_APP_DEBUG_TOOLS_ENABLED === 'true',
    devToolsEnabled: process.env.VUE_APP_DEV_TOOLS_ENABLED === 'true'
  },

  storage: {
    encryption: process.env.VUE_APP_STORAGE_ENCRYPTION === 'true',
    sessionTimeout: parseInt(process.env.VUE_APP_SESSION_TIMEOUT) || 0
  },

  proxy: {
    enabled: process.env.VUE_APP_PROXY_ENABLED === 'true',
    url: process.env.VUE_APP_PROXY_URL || '',
    port: parseInt(process.env.VUE_APP_PROXY_PORT) || 0
  },

  logging: {
    level: process.env.VUE_APP_LOG_LEVEL || 'info',
    toFile: process.env.VUE_APP_LOG_TO_FILE === 'true',
    filePath: process.env.VUE_APP_LOG_FILE_PATH || './logs/chatall.log'
  }
});

export function getConfig() {
  return config;
}

export function getEnv() {
  return config.env;
}

export function isProduction() {
  return config.env === 'production';
}

export function isDevelopment() {
  return config.env === 'development';
}

export function isStaging() {
  return config.env === 'staging';
}

export function validateConfig() {
  const errors = [];

  if (!config.version) {
    errors.push('VUE_APP_VERSION is required');
  }

  if (!config.name) {
    errors.push('VUE_APP_NAME is required');
  }

  if (!['development', 'staging', 'production'].includes(config.env)) {
    errors.push('VUE_APP_ENV must be one of: development, staging, production');
  }

  if (!config.api.baseUrl) {
    errors.push('VUE_APP_API_BASE_URL is required');
  }

  if (errors.length > 0) {
    console.error('Configuration validation failed:', errors);
    throw new Error('Configuration validation failed: ' + errors.join(', '));
  }

  return true;
}

export default config;