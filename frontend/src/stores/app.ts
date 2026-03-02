import { createStore } from 'solid-js/store'

class AppConfig {
  theme = 'auto'
  notesConfig: {
    defaultDir: string
  } = {
    defaultDir: '',
  }
  constructor(source = {}) {
    Object.assign(this, source)
  }
  static createFrom(source = {}) {
    return new AppConfig(source)
  }
}

const [configStore, setConfigStore] = createStore<AppConfig>({
  theme: 'auto',
  notesConfig: {
    defaultDir: '',
  },
})

export { configStore, setConfigStore }
