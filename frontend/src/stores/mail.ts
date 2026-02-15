import { createStore } from 'solid-js/store'
import { MailAccountService } from '#/wmail/services'
import type { Account } from '#/wmail/services'

interface MailState {
  accounts: Account[]
  currentAccount: Account | null
  currentFolder: string | null
  loading: boolean
  error: string | null
}

const [mailState, setMailState] = createStore<MailState>({
  accounts: [],
  currentAccount: null,
  currentFolder: null,
  loading: false,
  error: null,
})

export const mailStore = {
  state: mailState,

  async loadAccounts() {
    setMailState({ loading: true, error: null })
    try {
      const accounts = await MailAccountService.GetAccounts()
      setMailState({ accounts: accounts.filter((i) => i !== null), loading: false })
    } catch (error) {
      setMailState({ error: String(error), loading: false })
    }
  },

  async addAccount(account: Omit<Account, 'id' | 'createdAt'>) {
    setMailState({ loading: true, error: null })
    try {
      const newAccount = await MailAccountService.AddAccount({
        ...account,
        id: '',
        createdAt: new Date().toISOString(),
      })
      setMailState((state) => ({
        accounts: [...state.accounts, newAccount],
        loading: false,
      }))
      return newAccount
    } catch (error) {
      setMailState({ error: String(error), loading: false })
      throw error
    }
  },

  async updateAccount(account: Account) {
    setMailState({ loading: true, error: null })
    try {
      await MailAccountService.UpdateAccount(account)
      setMailState((state) => ({
        accounts: state.accounts.map((a) => (a.id === account.id ? account : a)),
        loading: false,
      }))
    } catch (error) {
      setMailState({ error: String(error), loading: false })
      throw error
    }
  },

  async deleteAccount(accountId: string) {
    setMailState({ loading: true, error: null })
    try {
      await MailAccountService.DeleteAccount(accountId)
      setMailState((state) => ({
        accounts: state.accounts.filter((a) => a.id !== accountId),
        currentAccount: state.currentAccount?.id === accountId ? null : state.currentAccount,
        loading: false,
      }))
    } catch (error) {
      setMailState({ error: String(error), loading: false })
      throw error
    }
  },

  setCurrentAccount(account: Account | null) {
    setMailState({ currentAccount: account })
  },

  setCurrentFolder(folder: string | null) {
    setMailState({ currentFolder: folder })
  },

  clearError() {
    setMailState({ error: null })
  },
}

export default mailStore
