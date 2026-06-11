export class Bot {
  constructor() {
    this.id = ''
    this.name = ''
    this.description = ''
    this.icon = 'mdi-bot'
    this.enabled = true
    this.available = true
    this.type = 'api'
    this.apiKeyRequired = false
    this.loginUrl = null
    this.baseUrl = null
  }

  async init() {}

  async chat(message, options = {}) {
    throw new Error('Not implemented')
  }

  async streamChat(message, options = {}, onChunk) {
    throw new Error('Not implemented')
  }

  async stop() {}

  async checkStatus() {
    return { online: true }
  }

  getLoginUrl() {
    return this.loginUrl
  }

  getLoginHyperlink() {
    const url = this.getLoginUrl()
    if (!url) return ''
    return `<a href="${url}" target="innerWindow" rel="noopener noreferrer nofollow">${url}</a>`
  }

  wrapCollapsedSection(text) {
    text = text?.toString()?.replace(/[\r\n]+/g, '<br/>')
    return `<details open>
              <summary>Error</summary>
              <pre class="error">${text}</pre>
            </details>`
  }

  getSSEDisplayError(event) {
    if (event?.source?.xhr?.getResponseHeader('cf-mitigated') === 'challenge') {
      return `Please solve the Cloudflare challenge\n${this.getLoginHyperlink()}`
    }
    return `${event?.source?.xhr?.status}\n${event?.source?.xhr?.response}`
  }
}

export default Bot