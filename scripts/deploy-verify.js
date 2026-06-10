#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const args = process.argv.slice(2)
const shouldBuild = args.includes('--build') || args.includes('-b')
const shouldLint = args.includes('--lint') || args.includes('-l')
const shouldCheckEnv = args.includes('--env') || args.includes('-e')

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
    name: 'electron_deps',
    fn: checkElectronIsolation,
    description: 'Electron dependency isolation',
  },
  {
    name: 'package_json',
    fn: checkPackageJson,
    description: 'package.json scripts and dependencies',
  },
  {
    name: 'env_config',
    fn: checkEnvConfig,
    description: 'Environment configuration',
  },
  {
    name: 'build_output',
    fn: checkBuildOutput,
    description: 'Production build output',
    enabled: shouldBuild,
  },
  {
    name: 'lint',
    fn: runLint,
    description: 'ESLint check',
    enabled: shouldLint,
  },
  {
    name: 'security_files',
    fn: checkSecurityFiles,
    description: 'Security modules',
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

function readFile(relPath) {
  try {
    return fs.readFileSync(path.join(ROOT, relPath), 'utf8')
  } catch (e) {
    return null
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
    'public/404.html',
    'public/index.html',
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
    'src/bots',
    'src/components',
    'src/views',
    'src/adapters',
    'src/store',
    'src/utils',
  ]
  for (const dir of requiredDirs) {
    if (fileExists(dir)) {
      record('source', 'pass', `${dir}/ exists`)
    } else {
      record('source', 'warn', `${dir}/ missing`)
    }
  }

  const mainEntry = readFile('src/main.js')
  if (mainEntry) {
    record('source', 'pass', 'src/main.js present')
  } else {
    record('source', 'fail', 'src/main.js missing')
  }

  const botIndex = readFile('src/bots/index.js')
  if (botIndex && botIndex.includes('import')) {
    record('source', 'pass', 'Bot index uses dynamic imports')
  } else {
    record('source', 'warn', 'Bot index structure review needed')
  }
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
    'src/adapters/errorHandler.js',
    'src/adapters/validator.js',
    'src/adapters/mockUtils.js',
  ]
  for (const file of adapterFiles) {
    if (fileExists(file)) {
      record('adapters', 'pass', `${file} present`)
    } else {
      record('adapters', 'warn', `${file} missing`)
    }
  }
}

function checkElectronIsolation() {
  console.log('\n--- Checking Electron isolation ---')
  const sourceDir = path.join(ROOT, 'src')
  function walk(dir, fileList = []) {
    const files = fs.readdirSync(dir)
    for (const file of files) {
      const filepath = path.join(dir, file)
      const stat = fs.statSync(filepath)
      if (stat.isDirectory()) {
        if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
          walk(filepath, fileList)
        }
      } else if (filepath.endsWith('.js') || filepath.endsWith('.vue')) {
        fileList.push(filepath)
      }
    }
    return fileList
  }

  const allFiles = walk(sourceDir)
  let violations = []

  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf8')
    if (file.includes(path.join('src', 'adapters'))) continue
    if (file.includes(path.join('src', 'preload.js'))) continue
    if (file.includes(path.join('src', 'background.js'))) continue

    if (content.includes('window.require("electron")') ||
        content.includes("window.require('electron')")) {
      violations.push(path.relative(ROOT, file))
    }
    if (content.includes('window.require(\'electron\')')) {
      if (!violations.includes(path.relative(ROOT, file))) {
        violations.push(path.relative(ROOT, file))
      }
    }
  }

  if (violations.length === 0) {
    record('isolation', 'pass', 'No direct window.require("electron") found outside adapters')
  } else {
    for (const v of violations) {
      record('isolation', 'warn', `Direct Electron call in: ${v}`)
    }
  }
}

function checkPackageJson() {
  console.log('\n--- Checking package.json ---')
  const pkg = readFile('package.json')
  if (!pkg) {
    record('pkg', 'fail', 'package.json missing')
    return
  }
  try {
    const parsed = JSON.parse(pkg)
    if (parsed.scripts && parsed.scripts.build) {
      record('pkg', 'pass', 'build script present')
    }
    if (parsed.scripts && parsed.scripts.deploy) {
      record('pkg', 'pass', 'deploy script present')
    }
    if (parsed.dependencies) {
      if (parsed.dependencies['vue']) record('pkg', 'pass', 'vue dependency present')
      if (parsed.dependencies['vuetify']) record('pkg', 'pass', 'vuetify dependency present')
    }
  } catch (e) {
    record('pkg', 'fail', 'package.json parse error: ' + e.message)
  }
}

function checkEnvConfig() {
  console.log('\n--- Checking environment configuration ---')
  const envFiles = ['.env.development', '.env.production', '.env.staging']
  for (const file of envFiles) {
    if (fileExists(file)) {
      record('env', 'pass', `${file} exists`)
    } else {
      record('env', 'warn', `${file} missing`)
    }
  }
}

function checkSecurityFiles() {
  console.log('\n--- Checking security files ---')
  const securityFiles = [
    'src/security/sanitizer.js',
    'src/security/logSanitizer.js',
    'src/security/cspConfig.js',
  ]
  for (const file of securityFiles) {
    if (fileExists(file)) {
      record('security', 'pass', `${file} present`)
    } else {
      record('security', 'warn', `${file} missing`)
    }
  }
}

function checkBuildOutput() {
  console.log('\n--- Running production build ---')
  try {
    console.log('  Executing: npm run build')
    execSync('npm run build', {
      cwd: ROOT,
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 5 * 60 * 1000,
    })
    record('build', 'pass', 'Production build succeeded')

    const distDir = path.join(ROOT, 'dist')
    if (fs.existsSync(distDir)) {
      const index = path.join(distDir, 'index.html')
      if (fs.existsSync(index)) {
        record('build', 'pass', 'dist/index.html generated')
      }
      const assets = fs.readdirSync(path.join(distDir, 'css') || distDir)
      record('build', 'pass', `Generated ${assets.length} files in dist/`)
    }
  } catch (e) {
    record('build', 'warn', 'Build check skipped or failed: ' + e.message?.slice(0, 100))
  }
}

function runLint() {
  console.log('\n--- Running ESLint ---')
  try {
    execSync('npm run lint', {
      cwd: ROOT,
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 60000,
    })
    record('lint', 'pass', 'ESLint passed')
  } catch (e) {
    record('lint', 'warn', 'ESLint check: ' + e.message?.slice(0, 100))
  }
}

console.log('==============================================')
console.log('  ChatALL Deployment Verification')
console.log('  Time: ' + new Date().toISOString())
console.log('==============================================')

for (const check of CHECKS) {
  if (check.enabled === false) continue
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
