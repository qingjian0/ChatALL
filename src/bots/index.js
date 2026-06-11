export { default as Bot } from './Bot'

const botClasses = []

export function registerBot(BotClass) {
  botClasses.push(BotClass)
}

export function getBotClasses() {
  return botClasses
}

export default botClasses