import Dexie from 'dexie'

export const db = new Dexie('ChatALL')

db.version(1).stores({
  chats: 'id++, title, favBots, contexts, createdTime, modifiedTime, isTitleUserEdited',
  messages: 'id++, chatId, type, content, format, model, className, promptIndex, createdTime, modifiedTime, done',
  threads: 'id++, chatId, messageId, type, content, createdTime, modifiedTime, done',
})

db.version(2).stores({
  chats: 'id++, title, favBots, contexts, createdTime, modifiedTime, isTitleUserEdited, selectedTime',
  messages: 'id++, chatId, type, content, format, model, className, promptIndex, createdTime, modifiedTime, done',
  threads: 'id++, chatId, messageId, type, content, createdTime, modifiedTime, done',
}).upgrade(async (tx) => {
  await tx.chats.toCollection().modify((chat) => {
    chat.selectedTime = chat.createdTime
  })
})

export async function exportDatabase() {
  try {
    const data = await db.export({ prettyJson: true })
    return data
  } catch (error) {
    console.error('Failed to export database:', error)
    throw error
  }
}

export async function importDatabase(data) {
  try {
    await db.delete()
    await db.import(data)
    return true
  } catch (error) {
    console.error('Failed to import database:', error)
    throw error
  }
}

export async function clearDatabase() {
  try {
    await db.chats.clear()
    await db.messages.clear()
    await db.threads.clear()
    return true
  } catch (error) {
    console.error('Failed to clear database:', error)
    throw error
  }
}
