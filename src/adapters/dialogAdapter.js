import { isElectron } from './platformDetector'

let electronDialog = null

try {
  if (isElectron() && typeof window.require === 'function') {
    const { dialog } = window.require('electron')
    electronDialog = dialog
  }
} catch (e) {
  console.warn('[Dialog Adapter] Electron Dialog not available')
}

const dialog = {
  showMessageBox: async (options) => {
    if (electronDialog) {
      return electronDialog.showMessageBox(options)
    }
    const buttons = options?.buttons || ['OK']
    const message = options?.message || ''
    const title = options?.title || ''
    
    if (options?.type === 'error') {
      alert(`${title}\n\n${message}`)
    } else if (options?.type === 'warning') {
      if (confirm(`${title}\n\n${message}`)) {
        return { response: 0, checkboxChecked: false }
      }
      return { response: 1, checkboxChecked: false }
    } else {
      alert(`${title}\n\n${message}`)
    }
    return { response: 0, checkboxChecked: false }
  },

  showOpenDialog: async (options) => {
    if (electronDialog) {
      return electronDialog.showOpenDialog(options)
    }
    return new Promise(resolve => {
      const input = document.createElement('input')
      input.type = 'file'
      if (options?.properties?.includes('openDirectory')) {
        input.webkitdirectory = true
      }
      if (options?.properties?.includes('multiSelections')) {
        input.multiple = true
      }
      if (options?.filters?.length > 0) {
        input.accept = options.filters.map(f => f.extensions?.map(e => `.${e}`).join(',')).join(',')
      }
      input.style.display = 'none'
      document.body.appendChild(input)
      input.addEventListener('change', () => {
        const filePaths = Array.from(input.files).map(f => f.path || f.name)
        resolve({ canceled: !input.files.length, filePaths })
        document.body.removeChild(input)
      })
      input.click()
    })
  },

  showSaveDialog: async (options) => {
    if (electronDialog) {
      return electronDialog.showSaveDialog(options)
    }
    return new Promise(resolve => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = options?.filters?.[0]?.extensions?.map(e => `.${e}`).join(',') || '*'
      input.style.display = 'none'
      document.body.appendChild(input)
      input.addEventListener('change', () => {
        const filePath = input.files?.[0]?.path || input.files?.[0]?.name
        resolve({ canceled: !filePath, filePath })
        document.body.removeChild(input)
      })
      input.click()
    })
  },

  showErrorBox: (title, content) => {
    if (electronDialog) {
      electronDialog.showErrorBox(title, content)
      return
    }
    alert(`${title}\n\n${content}`)
  }
}

export { dialog }
export default dialog