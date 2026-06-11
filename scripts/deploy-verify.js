#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const args = process.argv.slice(2)
const shouldBuild = args.includes('--build') || args.includes('-b')
const shouldLint = args.includes('--lint') || args.includes('-l')

const CHECKS = [
  {
    name: 'project_config',
    fn: checkProjectConfig,
    description: 'Project configuration files',
  },
  {
    name: 'source_files',
    fn: checkSourceFiles,
    description: 'Source code structure',
  },
  {
    name: 'adapters',
    fn: checkAdapters,
    description: 'Platform adapter layer',
  },
  {
    name: 'security',
    fn: checkSecurityFiles,
    description: 'Security modules',
  },
  {
    name: 'stores',
    fn: checkStores,
    description: 'Pinia stores',
  },
  {
    name: 'router',
    fn: checkRouter,
    description: 'Router configuration',
  },
  {
    name: 'views',
    fn: checkViews,
    description: 'View components',
  },
]

const ROOT = path.resolve(__dirname, '..')
const results = []

function fileExists(relPath) {
  try {
    return fs.existsSync(path.join(ROOT, relPath))
  } catch (e) {
    return false
  }
}

function record(checkName, status, message) {
  results.push({ check: checkName, status, message })
  const icon = status === 'pass' ? '✓' : status === 'warn' ? '!' : '✗'
  console.log(`  ${icon} [${status.toUpperCase()}] ${message}`)
}

function checkProjectConfig() {
  console.log('\n--- Checking project configuration ---')
  const requiredFiles = [
    'package.json',
    'vue.config.js',
    'public/index.html',
    'public/404.html',
    '.env.development',
    '.env.production',
  ]
  for (const file of requiredFiles) {
    if (fileExists(file)) {
      record('config', 'pass', `${file} exists`)
    } else {
      record('config', 'warn', `${file} missing`)
    }
  }
}

function checkSourceFiles() {
  console.log('\n--- Checking source files ---')
  const requiredDirs = [
    'src',
    'src/adapters',
    'src/stores',
    'src/views',
    'src/bots',
    'src/utils',
    'src/security',
    'src/router',
    'src/i18n',
  ]
  for (const dir of requiredDirs) {
    if (fileExists(dir)) {
      record('source', 'pass', `${dir}/ exists`)
    } else {
      record('source', 'warn', `${dir}/ missing`)
    }
  }

  const mainEntry = fileExists('src/main.js')
  const appEntry = fileExists('src/App.vue')
  const themeEntry = fileExists('src/theme.js')

  if (mainEntry) record('source', 'pass', 'src/main.js present')
  else record('source', 'fail', 'src/main.js missing')
  
  if (appEntry) record('source', 'pass', 'src/App.vue present')
  else record('source', 'fail', 'src/App.vue missing')
  
  if (themeEntry) record('source', 'pass', 'src/theme.js present')
  else record('source', 'warn', 'src/theme.js missing')
}

function checkAdapters() {
  console.log('\n--- Checking platform adapters ---')
  const adapterFiles = [
    'src/adapters/index.js',
    'src/adapters/platformDetector.js',
    'src/adapters/ipcAdapter.js',
    'src/adapters/shellAdapter.js',
    'src/adapters/dialogAdapter.js',
    'src/adapters/appAdapter.js',
    'src/adapters/themeAdapter.js',
  ]
  for (const file of adapterFiles) {
    if (fileExists(file)) {
      record('adapters', 'pass', `${file} present`)
    } else {
      record('adapters', 'warn', `${file} missing`)
    }
  }
}

function checkSecurityFiles() {
  console.log('\n--- Checking security files ---')
  const securityFiles = [
    'src/security/sanitizer.js',
    'src/security/logSanitizer.js',
    'src/security/cspConfig.js',
    'src/security/secureStore.js',
  ]
  for (const file of securityFiles) {
    if (fileExists(file)) {
      record('security', 'pass', `${file} present`)
    } else {
      record('security', 'warn', `${file} missing`)
    }
  }
}

function checkStores() {
  console.log('\n--- Checking Pinia stores ---')
  const storeFiles = [
    'src/stores/chatStore.js',
    'src/stores/botStore.js',
    'src/stores/settingsStore.js',
    'src/stores/secureStore.js',
  ]
  for (const file of storeFiles) {
    if (fileExists(file)) {
      record('stores', 'pass', `${file} present`)
    } else {
      record('stores', 'warn', `${file} missing`)
    }
  }
}

function checkRouter() {
  console.log('\n--- Checking router ---')
  if (fileExists('src/router/index.js')) {
    record('router', 'pass', 'src/router/index.js present')
  } else {
    record('router', 'fail', 'src/router/index.js missing')
  }
}

function checkViews() {
  console.log('\n--- Checking views ---')
  const viewFiles = [
    'src/views/HomeView.vue',
    'src/views/SettingsView.vue',
    'src/views/WelcomeView.vue',
    'src/views/AboutView.vue',
    'src/views/HelpView.vue',
    'src/views/LoginView.vue',
    'src/views/LockView.vue',
    'src/views/NotFound.vue',
  ]
  for (const file of viewFiles) {
    if (fileExists(file)) {
      record('views', 'pass', `${file} present`)
    } else {
      record('views', 'warn', `${file} missing`)
    }
  }

  const settingsViews = [
    'src/views/settings/BotsSettings.vue',
    'src/views/settings/AppearanceSettings.vue',
    'src/views/settings/AccountSettings.vue',
    'src/views/settings/SecuritySettings.vue',
    'src/views/settings/PrivacySettings.vue',
    'src/views/settings/AdvancedSettings.vue',
  ]
  for (const file of settingsViews) {
    if (fileExists(file)) {
      record('views', 'pass', `${file} present`)
    } else {
      record('views', 'warn', `${file} missing`)
    }
  }
}

console.log('==============================================')
console.log('  ChatALL Web Access - Deployment Verification')
console.log('  Time: ' + new Date().toISOString())
console.log('==============================================')

for (const check of CHECKS) {
  try {
    check.fn()
  } catch (e) {
    console.error(`  Error in check [${check.name}]:`, e.message)
  }
}

console.log('\n==============================================')
console.log('  Summary')
console.log('==============================================')
const summary = results.reduce((acc, r) => {
  acc[r.status] = (acc[r.status] || 0) + 1
  return acc
}, {})
console.log(`  PASS: ${summary.pass || 0}`)
console.log(`  WARN: ${summary.warn || 0}`)
console.log(`  FAIL: ${summary.fail || 0}`)
console.log('==============================================')

const hasFail = results.some(r => r.status === 'fail')
process.exit(hasFail ? 1 : 0)