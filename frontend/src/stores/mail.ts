import { createStore } from 'solid-js/store'
import { MailAccountService } from '#/wmail/services'
import type { Account } from '#/wmail/services'
import { toaster } from '~/components/ui/toaster'

interface MailState {
  accounts: Account[]
  currentAccount: Account | null
  currentFolder: string | null
  loading: boolean
  error: string | null
  expandedAccounts: Record<string, boolean> // 存储每个账号的展开状态
}

const [mailState, setMailState] = createStore<MailState>({
  accounts: [],
  currentAccount: null,
  currentFolder: null,
  loading: false,
  error: null,
  expandedAccounts: {},
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
      }) as Account
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
      toaster.success({title: 'Deleted an account!'})
    } catch (error) {
      setMailState({ error: String(error), loading: false })
      toaster.error({title: 'Error occurred!', description: String(error)})
      // throw error
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

  setAccountExpanded(accountId: string, expanded: boolean) {
    setMailState('expandedAccounts', accountId, expanded)
  },

  toggleAccountExpanded(accountId: string) {
    setMailState('expandedAccounts', accountId, (prev) => !prev)
  },
}

export default mailStore
