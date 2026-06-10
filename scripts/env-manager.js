#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ENV_DIR = path.join(__dirname, '..');
const ENCRYPTION_KEY_FILE = path.join(ENV_DIR, '.env.key');

class EnvManager {
  constructor() {
    this.encryptionKey = this.loadOrGenerateKey();
  }

  loadOrGenerateKey() {
    if (fs.existsSync(ENCRYPTION_KEY_FILE)) {
      return fs.readFileSync(ENCRYPTION_KEY_FILE, 'utf8');
    } else {
      const key = crypto.randomBytes(32).toString('hex');
      fs.writeFileSync(ENCRYPTION_KEY_FILE, key);
      fs.chmodSync(ENCRYPTION_KEY_FILE, 0o600);
      return key;
    }
  }

  encrypt(value) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  decrypt(encryptedValue) {
    const [ivHex, encryptedHex] = encryptedValue.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  loadEnv(envName = 'development') {
    const envPath = path.join(ENV_DIR, `.env.${envName}`);
    if (!fs.existsSync(envPath)) {
      throw new Error(`Environment file not found: ${envPath}`);
    }

    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};

    content.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split('=', 2);
        if (key && value) {
          env[key] = value;
        }
      }
    });

    return env;
  }

  saveEnv(env, envName = 'development') {
    const envPath = path.join(ENV_DIR, `.env.${envName}`);
    let content = `# ChatALL ${envName.charAt(0).toUpperCase() + envName.slice(1)} Environment Configuration\n`;
    content += '# =============================================\n\n';

    const sections = {
      'Application Settings': ['VUE_APP_VERSION', 'VUE_APP_NAME', 'VUE_APP_DESCRIPTION', 'VUE_APP_ENV'],
      'API Configuration': ['VUE_APP_API_BASE_URL', 'VUE_APP_API_TIMEOUT'],
      'Security Settings': ['VUE_APP_SECURITY_ENABLED', 'VUE_APP_CORS_ENABLED', 'VUE_APP_CSP_ENABLED'],
      'Feature Flags': ['VUE_APP_FEATURE_DEBUG_MODE', 'VUE_APP_FEATURE_LOGGING_VERBOSE', 'VUE_APP_FEATURE_AUTO_UPDATE', 'VUE_APP_FEATURE_TELEMETRY'],
      'Build Configuration': ['VUE_APP_BUILD_DATE', 'VUE_APP_BUILD_HASH', 'VUE_APP_BUILD_BRANCH'],
      'Analytics & Monitoring': ['VUE_APP_MATOMO_ENABLED', 'VUE_APP_MATOMO_URL', 'VUE_APP_MATOMO_SITE_ID'],
      'Debug Settings': ['VUE_APP_DEBUG_TOOLS_ENABLED', 'VUE_APP_DEV_TOOLS_ENABLED'],
      'Storage Settings': ['VUE_APP_STORAGE_ENCRYPTION', 'VUE_APP_SESSION_TIMEOUT'],
      'Proxy Settings': ['VUE_APP_PROXY_ENABLED', 'VUE_APP_PROXY_URL', 'VUE_APP_PROXY_PORT'],
      'Logging Settings': ['VUE_APP_LOG_LEVEL', 'VUE_APP_LOG_TO_FILE', 'VUE_APP_LOG_FILE_PATH'],
      'Secrets': ['VUE_APP_SECRET_KEY']
    };

    Object.entries(sections).forEach(([section, keys]) => {
      content += `# ${section}\n`;
      keys.forEach(key => {
        if (env[key] !== undefined) {
          content += `${key}=${env[key]}\n`;
        }
      });
      content += '\n';
    });

    fs.writeFileSync(envPath, content);
    console.log(`Environment file saved: ${envPath}`);
  }

  setSecret(key, value, envName = 'production') {
    const env = this.loadEnv(envName);
    const encryptedValue = this.encrypt(value);
    env[key] = encryptedValue;
    this.saveEnv(env, envName);
    console.log(`Secret ${key} set in ${envName} environment`);
  }

  getSecret(key, envName = 'production') {
    const env = this.loadEnv(envName);
    if (env[key]) {
      try {
        return this.decrypt(env[key]);
      } catch {
        return env[key];
      }
    }
    return null;
  }

  validateEnv(envName = 'development') {
    const env = this.loadEnv(envName);
    const requiredVars = [
      'VUE_APP_VERSION',
      'VUE_APP_NAME',
      'VUE_APP_ENV',
      'VUE_APP_API_BASE_URL'
    ];

    const missingVars = requiredVars.filter(v => !env[v]);
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    console.log(`Environment ${envName} validation passed`);
    return true;
  }
}

module.exports = EnvManager;

if (require.main === module) {
  const manager = new EnvManager();
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: env-manager.js <command> [options]');
    console.log('Commands:');
    console.log('  validate <env>       Validate environment variables');
    console.log('  set-secret <key> <value> [<env>]  Set encrypted secret');
    console.log('  get-secret <key> [<env>]          Get decrypted secret');
    console.log('  load <env>           Load and display environment');
    process.exit(0);
  }

  const command = args[0];

  try {
    switch (command) {
      case 'validate':
        manager.validateEnv(args[1] || 'development');
        break;
      case 'set-secret':
        manager.setSecret(args[1], args[2], args[3] || 'production');
        break;
      case 'get-secret':
        const secret = manager.getSecret(args[1], args[2] || 'production');
        console.log(secret);
        break;
      case 'load':
        const env = manager.loadEnv(args[1] || 'development');
        console.log(JSON.stringify(env, null, 2));
        break;
      default:
        console.log(`Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}