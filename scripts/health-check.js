#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const rootDir = path.join(__dirname, '..');

class HealthChecker {
  constructor() {
    this.checks = [];
    this.results = {
      healthy: [],
      unhealthy: [],
      warnings: []
    };
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[34m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}[${type.toUpperCase()}]${colors.reset} ${message}`);
  }

  async checkFileExists(filePath, description) {
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      this.results.healthy.push(description);
      this.log(`${description}: ✓`, 'success');
      return true;
    } catch {
      this.results.unhealthy.push(description);
      this.log(`${description}: ✗ File not found`, 'error');
      return false;
    }
  }

  async checkDirectoryExists(dirPath, description) {
    try {
      const stat = await fs.promises.stat(dirPath);
      if (stat.isDirectory()) {
        this.results.healthy.push(description);
        this.log(`${description}: ✓`, 'success');
        return true;
      }
    } catch {
      this.results.unhealthy.push(description);
      this.log(`${description}: ✗ Directory not found`, 'error');
      return false;
    }
  }

  async checkPackageJson() {
    this.log('Checking package.json...');
    const pkgPath = path.join(rootDir, 'package.json');
    
    if (await this.checkFileExists(pkgPath, 'package.json exists')) {
      const pkg = JSON.parse(await fs.promises.readFile(pkgPath, 'utf8'));
      
      if (pkg.version) {
        this.results.healthy.push(`Version: ${pkg.version}`);
        this.log(`Version: ${pkg.version} ✓`, 'success');
      } else {
        this.results.warnings.push('Version not specified');
        this.log('Version not specified ⚠', 'warning');
      }

      if (pkg.scripts && pkg.scripts.build) {
        this.results.healthy.push('Build script exists');
        this.log('Build script exists ✓', 'success');
      } else {
        this.results.unhealthy.push('Build script missing');
        this.log('Build script missing ✗', 'error');
      }
    }
  }

  async checkEnvironmentConfig() {
    this.log('Checking environment configuration...');
    
    const env = process.env.NODE_ENV || 'development';
    const envPath = path.join(rootDir, `.env.${env}`);
    
    if (await this.checkFileExists(envPath, `.env.${env} exists`)) {
      const content = await fs.promises.readFile(envPath, 'utf8');
      const requiredVars = [
        'VUE_APP_VERSION',
        'VUE_APP_ENV',
        'VUE_APP_API_BASE_URL'
      ];

      requiredVars.forEach(v => {
        if (content.includes(v)) {
          const match = content.match(new RegExp(`${v}=\\s*([^\\n]+)`));
          if (match && match[1].trim()) {
            this.results.healthy.push(`${v} is configured`);
          } else {
            this.results.warnings.push(`${v} is empty`);
            this.log(`${v} is empty ⚠`, 'warning');
          }
        } else {
          this.results.unhealthy.push(`${v} is missing`);
          this.log(`${v} is missing ✗`, 'error');
        }
      });
    }
  }

  async checkBuildOutput() {
    this.log('Checking build output...');
    const distDir = path.join(rootDir, 'dist');
    
    if (await this.checkDirectoryExists(distDir, 'dist directory exists')) {
      const files = await fs.promises.readdir(distDir);
      
      const requiredFiles = ['index.html', 'js', 'css'];
      requiredFiles.forEach(file => {
        if (files.includes(file)) {
          this.results.healthy.push(`${file} exists in dist`);
          this.log(`${file} exists ✓`, 'success');
        } else {
          this.results.unhealthy.push(`${file} missing from dist`);
          this.log(`${file} missing ✗`, 'error');
        }
      });

      const jsFiles = files.filter(f => f.startsWith('js/') || f.endsWith('.js'));
      if (jsFiles.length > 0) {
        this.results.healthy.push(`Found ${jsFiles.length} JS files`);
      }
    }
  }

  async checkDependencies() {
    this.log('Checking dependencies...');
    const nodeModules = path.join(rootDir, 'node_modules');
    
    if (await this.checkDirectoryExists(nodeModules, 'node_modules exists')) {
      const pkgLock = path.join(rootDir, 'package-lock.json');
      if (await this.checkFileExists(pkgLock, 'package-lock.json exists')) {
        this.results.healthy.push('Dependencies are locked');
      }
    }
  }

  async checkApiHealth(baseUrl) {
    if (!baseUrl || baseUrl === '') {
      this.results.warnings.push('API base URL not configured, skipping API health check');
      this.log('API base URL not configured, skipping ⚠', 'warning');
      return;
    }

    this.log(`Checking API health at ${baseUrl}...`);
    
    return new Promise((resolve) => {
      const url = new URL(`${baseUrl}/health`);
      const client = url.protocol === 'https:' ? https : http;
      
      const req = client.request({
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'GET',
        timeout: 5000
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode === 200) {
            this.results.healthy.push('API is healthy');
            this.log('API health check: ✓', 'success');
            
            try {
              const responseData = JSON.parse(data);
              if (responseData && typeof responseData === 'object') {
                if (responseData.version) {
                  this.log(`API Version: ${responseData.version}`, 'info');
                }
              }
            } catch (e) {
              // Not JSON response, ignore
            }
          } else {
            this.results.unhealthy.push(`API returned status ${res.statusCode}`);
            this.log(`API returned status ${res.statusCode} ✗`, 'error');
          }
          resolve();
        });
      });

      req.on('error', (error) => {
        this.results.warnings.push(`API health check failed: ${error.message}`);
        this.log(`API health check failed: ${error.message} ⚠`, 'warning');
        resolve();
      });

      req.on('timeout', () => {
        req.destroy();
        this.results.warnings.push('API health check timed out');
        this.log('API health check timed out ⚠', 'warning');
        resolve();
      });

      req.end();
    });
  }

  async checkSecurityFiles() {
    this.log('Checking security files...');
    const securityDir = path.join(rootDir, 'src/security');
    
    if (await this.checkDirectoryExists(securityDir, 'security directory exists')) {
      const securityFiles = ['corsProxy.js', 'csp.js', 'logSanitizer.js', 'secureStorage.js'];
      
      for (const file of securityFiles) {
        const filePath = path.join(securityDir, file);
        if (await this.checkFileExists(filePath, `${file} exists`)) {
          const content = await fs.promises.readFile(filePath, 'utf8');
          if (content.length > 0) {
            this.results.healthy.push(`${file} has content`);
          } else {
            this.results.warnings.push(`${file} is empty`);
          }
        }
      }
    }
  }

  async checkConfigFiles() {
    this.log('Checking configuration files...');
    
    const configFiles = [
      { path: 'vue.config.js', desc: 'Vue configuration' },
      { path: 'babel.config.js', desc: 'Babel configuration' },
      { path: '.gitignore', desc: 'Git ignore file' }
    ];

    for (const { path: filePath, desc } of configFiles) {
      await this.checkFileExists(path.join(rootDir, filePath), `${desc} exists`);
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('HEALTH CHECK REPORT');
    console.log('='.repeat(60));
    
    console.log(`\nHealthy Checks: ${this.results.healthy.length}`);
    this.results.healthy.forEach(r => console.log(`  ✓ ${r}`));
    
    console.log(`\nWarnings: ${this.results.warnings.length}`);
    this.results.warnings.forEach(r => console.log(`  ⚠ ${r}`));
    
    console.log(`\nUnhealthy Checks: ${this.results.unhealthy.length}`);
    this.results.unhealthy.forEach(r => console.log(`  ✗ ${r}`));
    
    console.log('\n' + '='.repeat(60));
    
    if (this.results.unhealthy.length > 0) {
      console.log('\x1b[31m[ERROR]\x1b[0m Health check failed - unresolved issues detected');
      process.exit(1);
    } else if (this.results.warnings.length > 0) {
      console.log('\x1b[33m[WARNING]\x1b[0m Health check completed with warnings');
      process.exit(0);
    } else {
      console.log('\x1b[32m[SUCCESS]\x1b[0m All health checks passed');
      process.exit(0);
    }
  }

  async run(options = {}) {
    this.log('Starting health check...\n');

    await this.checkPackageJson();
    await this.checkEnvironmentConfig();
    await this.checkBuildOutput();
    await this.checkDependencies();
    await this.checkSecurityFiles();
    await this.checkConfigFiles();

    if (options.checkApi) {
      const env = process.env.NODE_ENV || 'development';
      const envPath = path.join(rootDir, `.env.${env}`);
      let baseUrl = '';
      
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const match = content.match(/VUE_APP_API_BASE_URL=(.+)/);
        if (match) {
          baseUrl = match[1].trim();
        }
      }
      
      await this.checkApiHealth(baseUrl);
    }

    this.generateReport();
  }
}

if (require.main === module) {
  const checker = new HealthChecker();
  const args = process.argv.slice(2);
  
  const options = {
    checkApi: args.includes('--check-api')
  };

  checker.run(options);
}