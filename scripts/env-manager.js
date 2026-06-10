#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const args = process.argv.slice(2)
const targetEnv = args[0] || process.env.NODE_ENV || 'development'

const envConfig = {
  development: {
    VUE_APP_ENV: 'development',
    VUE_APP_API_BASE_URL: 'http://localhost:8080',
    VUE_APP_USE_MOCK: 'false',
    VUE_APP_METRICS_ENABLED: 'true',
    VUE_APP_CSP_ENABLED: 'false',
  },
  staging: {
    VUE_APP_ENV: 'staging',
    VUE_APP_API_BASE_URL: 'https://staging-api.example.com',
    VUE_APP_USE_MOCK: 'false',
    VUE_APP_METRICS_ENABLED: 'true',
    VUE_APP_CSP_ENABLED: 'true',
  },
  production: {
    VUE_APP_ENV: 'production',
    VUE_APP_API_BASE_URL: 'https://api.chatall.app',
    VUE_APP_USE_MOCK: 'false',
    VUE_APP_METRICS_ENABLED: 'false',
    VUE_APP_CSP_ENABLED: 'true',
  },
}

const requiredVars = [
  'VUE_APP_ENV',
  'VUE_APP_API_BASE_URL',
]

function writeEnvFile(env, config) {
  const lines = Object.entries(config).map(([key, value]) => `${key}=${value}`)
  const content = lines.join('\n') + '\n'
  const filename = `.env.${env}`
  const filepath = path.resolve(__dirname, '..', filename)
  fs.writeFileSync(filepath, content)
  console.log(`✓ Written ${filename} (${lines.length} variables)`)
}

function validateEnv(env) {
  const config = envConfig[env]
  if (!config) {
    console.error(`✗ Unknown environment: ${env}`)
    console.error(`  Available: development, staging, production`)
    process.exit(1)
  }

  const missing = requiredVars.filter(v => !config[v])
  if (missing.length > 0) {
    console.error(`✗ Missing required variables for ${env}:`)
    missing.forEach(v => console.error(`  - ${v}`))
    process.exit(1)
  }

  console.log(`✓ Environment [${env}] validated successfully`)
  console.log(`  Variables: ${Object.keys(config).length}`)
  console.log()
}

console.log('==============================================')
console.log('  ChatALL Environment Manager')
console.log(`  Target: ${targetEnv}`)
console.log('==============================================\n')

if (targetEnv === 'validate') {
  for (const env of Object.keys(envConfig)) {
    validateEnv(env)
  }
  console.log('\n✓ All environments validated!\n')
  process.exit(0)
}

if (targetEnv === 'all' || targetEnv === 'write') {
  console.log('Writing all environment files...\n')
  for (const [env, config] of Object.entries(envConfig)) {
    writeEnvFile(env, config)
  }
  process.exit(0)
}

validateEnv(targetEnv)
writeEnvFile(targetEnv, envConfig[targetEnv])

console.log('\nDone! Run `npm run serve` or `npm run build` next.\n')
