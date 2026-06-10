#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');

class DeployVerifier {
  constructor() {
    this.results = {
      passed: [],
      failed: [],
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

  success(message) {
    this.log(message, 'success');
    this.results.passed.push(message);
  }

  warning(message) {
    this.log(message, 'warning');
    this.results.warnings.push(message);
  }

  error(message) {
    this.log(message, 'error');
    this.results.failed.push(message);
  }

  checkNodeVersion() {
    this.log('Checking Node.js version...');
    const requiredVersion = '20';
    const currentVersion = process.version.replace('v', '');
    const currentMajor = parseInt(currentVersion.split('.')[0]);

    if (currentMajor >= requiredVersion) {
      this.success(`Node.js version ${currentVersion} meets requirement (>= ${requiredVersion})`);
    } else {
      this.error(`Node.js version ${currentVersion} is below required ${requiredVersion}`);
    }
  }

  checkDependencies() {
    this.log('Checking dependencies...');
    const packageJsonPath = path.join(rootDir, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      this.error('package.json not found');
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const requiredDeps = ['vue', 'vue-router', 'pinia', 'vuetify'];

    requiredDeps.forEach(dep => {
      if (packageJson.dependencies[dep]) {
        this.success(`Dependency ${dep}@${packageJson.dependencies[dep]} found`);
      } else {
        this.error(`Dependency ${dep} not found in package.json`);
      }
    });

    this.log('Checking node_modules...');
    if (fs.existsSync(path.join(rootDir, 'node_modules'))) {
      this.success('node_modules directory exists');
    } else {
      this.warning('node_modules directory not found, run npm install');
    }
  }

  checkEnvironmentFiles() {
    this.log('Checking environment files...');
    const envs = ['development', 'production', 'staging'];

    envs.forEach(env => {
      const envPath = path.join(rootDir, `.env.${env}`);
      if (fs.existsSync(envPath)) {
        this.success(`.env.${env} exists`);
        this.validateEnvFile(envPath, env);
      } else {
        this.error(`.env.${env} not found`);
      }
    });
  }

  validateEnvFile(envPath, envName) {
    const content = fs.readFileSync(envPath, 'utf8');
    const requiredVars = [
      'VUE_APP_VERSION',
      'VUE_APP_NAME',
      'VUE_APP_ENV',
      'VUE_APP_API_BASE_URL'
    ];

    requiredVars.forEach(v => {
      if (content.includes(v)) {
        const match = content.match(new RegExp(`${v}=(.+)`));
        if (match && match[1].trim()) {
          this.success(`  - ${v} is set`);
        } else {
          this.warning(`  - ${v} is empty or not properly set`);
        }
      } else {
        this.error(`  - ${v} is missing`);
      }
    });
  }

  checkBuildConfig() {
    this.log('Checking build configuration...');
    const vueConfigPath = path.join(rootDir, 'vue.config.js');
    
    if (fs.existsSync(vueConfigPath)) {
      this.success('vue.config.js exists');
      
      const config = fs.readFileSync(vueConfigPath, 'utf8');
      const checks = [
        { pattern: 'publicPath', name: 'publicPath configuration' },
        { pattern: 'outputDir', name: 'outputDir configuration' },
        { pattern: 'configureWebpack', name: 'Webpack configuration' },
        { pattern: 'electronBuilder', name: 'Electron Builder configuration' }
      ];

      checks.forEach(check => {
        if (config.includes(check.pattern)) {
          this.success(`  - ${check.name} found`);
        } else {
          this.warning(`  - ${check.name} not found`);
        }
      });
    } else {
      this.error('vue.config.js not found');
    }
  }

  checkSecurityConfig() {
    this.log('Checking security configuration...');
    const securityDir = path.join(rootDir, 'src/security');
    
    if (fs.existsSync(securityDir)) {
      this.success('Security directory exists');
      
      const securityFiles = ['corsProxy.js', 'csp.js', 'logSanitizer.js', 'secureStorage.js'];
      securityFiles.forEach(file => {
        if (fs.existsSync(path.join(securityDir, file))) {
          this.success(`  - ${file} exists`);
        } else {
          this.warning(`  - ${file} not found`);
        }
      });
    } else {
      this.error('Security directory not found');
    }
  }

  checkGitStatus() {
    this.log('Checking git status...');
    try {
      const status = execSync('git status --porcelain', { cwd: rootDir, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
      
      if (status === '') {
        this.success('Working directory is clean');
      } else {
        this.warning('Working directory has uncommitted changes');
      }

      const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: rootDir, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
      this.log(`Current branch: ${branch}`);

      const commit = execSync('git rev-parse HEAD', { cwd: rootDir, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim().substring(0, 7);
      this.log(`Current commit: ${commit}`);
    } catch {
      this.warning('Cannot check git status (not a git repository)');
    }
  }

  runBuildCheck() {
    this.log('Running build check...');
    try {
      execSync('npm run build', { 
        cwd: rootDir, 
        stdio: ['ignore', 'ignore', 'pipe'],
        timeout: 300000
      });
      
      const distDir = path.join(rootDir, 'dist');
      if (fs.existsSync(distDir)) {
        this.success('Build completed successfully');
        
        const distFiles = fs.readdirSync(distDir);
        const requiredFiles = ['index.html', 'js', 'css', 'assets'];
        requiredFiles.forEach(file => {
          if (distFiles.includes(file)) {
            this.success(`  - ${file} exists in dist`);
          } else {
            this.error(`  - ${file} missing from dist`);
          }
        });
      } else {
        this.error('dist directory not created');
      }
    } catch (error) {
      this.error(`Build failed: ${error.message}`);
    }
  }

  runLintCheck() {
    this.log('Running lint check...');
    try {
      execSync('npm run lint', { 
        cwd: rootDir, 
        stdio: ['ignore', 'ignore', 'pipe']
      });
      this.success('Lint check passed');
    } catch (error) {
      this.error(`Lint check failed: ${error.message}`);
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('DEPLOYMENT VERIFICATION REPORT');
    console.log('='.repeat(60));
    
    console.log(`\nPassed: ${this.results.passed.length}`);
    this.results.passed.forEach(r => console.log(`  ✓ ${r}`));
    
    console.log(`\nWarnings: ${this.results.warnings.length}`);
    this.results.warnings.forEach(r => console.log(`  ⚠ ${r}`));
    
    console.log(`\nFailed: ${this.results.failed.length}`);
    this.results.failed.forEach(r => console.log(`  ✗ ${r}`));
    
    console.log('\n' + '='.repeat(60));
    
    if (this.results.failed.length > 0) {
      process.exit(1);
    } else {
      this.log('All checks passed! Deployment ready.', 'success');
      process.exit(0);
    }
  }

  verify(options = {}) {
    this.log('Starting deployment verification...\n');

    this.checkNodeVersion();
    this.checkDependencies();
    this.checkEnvironmentFiles();
    this.checkBuildConfig();
    this.checkSecurityConfig();
    this.checkGitStatus();

    if (options.runBuild) {
      this.runBuildCheck();
    }

    if (options.runLint) {
      this.runLintCheck();
    }

    this.generateReport();
  }
}

if (require.main === module) {
  const verifier = new DeployVerifier();
  const args = process.argv.slice(2);
  
  const options = {
    runBuild: args.includes('--build'),
    runLint: args.includes('--lint')
  };

  verifier.verify(options);
}