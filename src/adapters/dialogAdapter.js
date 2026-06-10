import { isElectron } from './platformDetector'

const dialog = {
  showErrorBox: async function (title, content) {
    if (isElectron()) {
      const { dialog } = window.require('electron').remote || window.require('electron')
      dialog.showErrorBox(title, content)
    } else {
      console.error(`[${title}] ${content}`)
      alert(`${title}\n\n${content}`)
    }
    return Promise.resolve()
  },

  showMessageBox: async function (options) {
    if (isElectron()) {
      const { dialog } = window.require('electron').remote || window.require('electron')
      return dialog.showMessageBox(options)
    } else {
      const buttons = options.buttons || ['OK']
      const message = options.message || ''
      const detail = options.detail || ''
      
      const fullMessage = detail ? `${message}\n\n${detail}` : message
      
      if (options.type === 'question') {
        const result = confirm(fullMessage)
        return Promise.resolve({ response: result ? 0 : 1 })
      } else if (options.type === 'warning' || options.type === 'error') {
        alert(fullMessage)
        return Promise.resolve({ response: 0 })
      } else {
        alert(fullMessage)
        return Promise.resolve({ response: 0 })
      }
    }
  },

  showOpenDialog: async function (options) {
    if (isElectron()) {
      const { dialog } = window.require('electron').remote || window.require('electron')
      return dialog.showOpenDialog(options)
    } else {
      return new Promise((resolve) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.multiple = options?.properties?.includes('multiSelections') || false
        
        if (options?.filters) {
          input.accept = options.filters.map(f => f.extensions.map(e => `.${e}`).join(',')).join(',')
        }
        
        input.onchange = () => {
          const filePaths = Array.from(input.files).map(f => f.name)
          resolve({ filePaths, canceled: filePaths.length === 0 })
        }
        
        input.click()
      })
    }
  },

  showSaveDialog: async function (options) {
    if (isElectron()) {
      const { dialog } = window.require('electron').remote || window.require('electron')
      return dialog.showSaveDialog(options)
    } else {
      return new Promise((resolve) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json'
        input.onchange = () => {
          const filePath = input.files?.[0]?.name || ''
          resolve({ filePath, canceled: !filePath })
        }
        input.click()
      })
    }
  },

  showMessageBoxSync: function (options) {
    if (isElectron()) {
      const { dialog } = window.require('electron').remote || window.require('electron')
      return dialog.showMessageBoxSync(options)
    } else {
      const buttons = options.buttons || ['OK']
      const message = options.message || ''
      const detail = options.detail || ''
      
      const fullMessage = detail ? `${message}\n\n${detail}` : message
      
      if (options.type === 'question') {
        return confirm(fullMessage) ? 0 : 1
      } else {
        alert(fullMessage)
        return 0
      }
    }
  },

  showOpenDialogSync: function (options) {
    if (isElectron()) {
      const { dialog } = window.require('electron').remote || window.require('electron')
      return dialog.showOpenDialogSync(options)
    } else {
      console.warn('dialog.showOpenDialogSync is not fully supported in web environment')
      return { filePaths: [], canceled: true }
    }
  },

  showSaveDialogSync: function (options) {
    if (isElectron()) {
      const { dialog } = window.require('electron').remote || window.require('electron')
      return dialog.showSaveDialogSync(options)
    } else {
      console.warn('dialog.showSaveDialogSync is not fully supported in web environment')
      return { filePath: '', canceled: true }
    }
  },
}

export { dialog }
