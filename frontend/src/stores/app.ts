import { createStore } from 'solid-js/store'

class AppConfig {
  theme = 'auto'
  constructor(source = {}) {
    Object.assign(this, source)
  }
  static createFrom(source = {}) {
    return new AppConfig(source)
  }
}

const [configStore, setConfigStore] = createStore<AppConfig>({
  theme: 'auto',
})

export { configStore, setConfigStore }
