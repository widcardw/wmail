import { For, Show, createSignal, onMount } from 'solid-js'
import { mailStore } from '~/stores/mail'
import type { Account } from '#/wmail/services'

export default function AccountsPage() {
  const [showForm, setShowForm] = createSignal(false)
  const [editingAccount, setEditingAccount] = createSignal<Account | null>(null)

  const [formData, setFormData] = createSignal({
    name: '',
    email: '',
    imapHost: '',
    imapPort: 993,
    imapUseSSL: true,
    smtpHost: '',
    smtpPort: 465,
    smtpUseSSL: true,
    username: '',
    password: '',
  })

  onMount(() => {
    mailStore.loadAccounts()
  })

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    try {
      if (editingAccount()) {
        await mailStore.updateAccount({
          ...editingAccount()!,
          ...formData(),
        })
      } else {
        await mailStore.addAccount(formData())
      }
      setShowForm(false)
      setEditingAccount(null)
      resetForm()
    } catch (error) {
      console.error('Failed to save account:', error)
    }
  }

  const handleEdit = (account: Account) => {
    setEditingAccount(account)
    setFormData({
      name: account.name,
      email: account.email,
      imapHost: account.imapHost,
      imapPort: account.imapPort,
      imapUseSSL: account.imapUseSSL,
      smtpHost: account.smtpHost,
      smtpPort: account.smtpPort,
      smtpUseSSL: account.smtpUseSSL,
      username: account.username,
      password: account.password,
    })
    setShowForm(true)
  }

  const handleDelete = async (accountId: string) => {
    if (confirm('Are you sure you want to delete this account?')) {
      await mailStore.deleteAccount(accountId)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      imapHost: '',
      imapPort: 993,
      imapUseSSL: true,
      smtpHost: '',
      smtpPort: 465,
      smtpUseSSL: true,
      username: '',
      password: '',
    })
  }

  const openAddForm = () => {
    setEditingAccount(null)
    resetForm()
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingAccount(null)
    resetForm()
  }

  return (
    <div class="p-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-white">Email Accounts</h1>
        <button
          type="button"
          onClick={openAddForm}
          class="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
        >
          <div class="flex items-center gap-2">
            <div class="i-ri-add-line w-5 h-5" />
            <span>Add Account</span>
          </div>
        </button>
      </div>

      <Show
        when={mailStore.state.loading}
        fallback={
          <Show
            when={mailStore.state.accounts.length === 0}
            fallback={
              <div class="grid gap-4">
                <For each={mailStore.state.accounts}>
                  {(account) => (
                    <div class="bg-surface border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                      <div class="flex items-start justify-between">
                        <div class="flex-1">
                          <h3 class="text-lg font-semibold text-white mb-1">
                            {account.name}
                          </h3>
                          <p class="text-muted-foreground">{account.email}</p>
                          <div class="mt-2 text-sm text-muted-foreground">
                            <div>IMAP: {account.imapHost}:{account.imapPort}</div>
                            <div>SMTP: {account.smtpHost}:{account.smtpPort}</div>
                          </div>
                        </div>
                        <div class="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(account)}
                            class="p-2 text-muted-foreground hover:text-white hover:bg-surface rounded transition-colors"
                          >
                            <div class="i-ri-edit-line w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(account.id)}
                            class="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                          >
                            <div class="i-ri-delete-bin-line w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            }
          >
            <div class="text-center py-12">
              <div class="i-ri-mail-line w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p class="text-muted-foreground mb-4">No email accounts yet</p>
              <button
                type="button"
                onClick={openAddForm}
                class="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
              >
                Add your first account
              </button>
            </div>
          </Show>
        }
      >
        <div class="text-center py-12">
          <div class="i-ri-loader-4-line w-8 h-8 animate-spin text-primary mx-auto" />
        </div>
      </Show>

      <Show when={showForm()}>
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-bg border border-border rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-white">
                {editingAccount() ? 'Edit Account' : 'Add Account'}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                class="p-2 text-muted-foreground hover:text-white hover:bg-surface rounded transition-colors"
              >
                <div class="i-ri-close-line w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} class="space-y-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-white mb-2">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={formData().name}
                    onInput={(e) => setFormData({ ...formData(), name: e.currentTarget.value })}
                    required
                    placeholder="Personal Gmail"
                    class="w-full px-3 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-white mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData().email}
                    onInput={(e) => setFormData({ ...formData(), email: e.currentTarget.value })}
                    required
                    placeholder="you@example.com"
                    class="w-full px-3 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-white mb-2">
                    Username (usually your email)
                  </label>
                  <input
                    type="text"
                    value={formData().username}
                    onInput={(e) => setFormData({ ...formData(), username: e.currentTarget.value })}
                    required
                    placeholder="you@example.com"
                    class="w-full px-3 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-white mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData().password}
                    onInput={(e) => setFormData({ ...formData(), password: e.currentTarget.value })}
                    required
                    placeholder="••••••••"
                    class="w-full px-3 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div class="border-t border-border pt-4">
                  <h3 class="text-sm font-medium text-white mb-4">IMAP Settings</h3>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm text-muted-foreground mb-2">Host</label>
                      <input
                        type="text"
                        value={formData().imapHost}
                        onInput={(e) => setFormData({ ...formData(), imapHost: e.currentTarget.value })}
                        required
                        placeholder="imap.gmail.com"
                        class="w-full px-3 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div class="flex gap-2">
                      <div class="flex-1">
                        <label class="block text-sm text-muted-foreground mb-2">Port</label>
                        <input
                          type="number"
                          value={formData().imapPort}
                          onInput={(e) => setFormData({ ...formData(), imapPort: parseInt(e.currentTarget.value) })}
                          required
                          placeholder="993"
                          class="w-full px-3 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div class="flex items-center pt-6">
                        <label class="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData().imapUseSSL}
                            onChange={(e) => setFormData({ ...formData(), imapUseSSL: e.currentTarget.checked })}
                            class="w-4 h-4 rounded border-border"
                          />
                          <span class="text-sm text-white">SSL</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="border-t border-border pt-4">
                  <h3 class="text-sm font-medium text-white mb-4">SMTP Settings</h3>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm text-muted-foreground mb-2">Host</label>
                      <input
                        type="text"
                        value={formData().smtpHost}
                        onInput={(e) => setFormData({ ...formData(), smtpHost: e.currentTarget.value })}
                        required
                        placeholder="smtp.gmail.com"
                        class="w-full px-3 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div class="flex gap-2">
                      <div class="flex-1">
                        <label class="block text-sm text-muted-foreground mb-2">Port</label>
                        <input
                          type="number"
                          value={formData().smtpPort}
                          onInput={(e) => setFormData({ ...formData(), smtpPort: parseInt(e.currentTarget.value) })}
                          required
                          placeholder="465"
                          class="w-full px-3 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div class="flex items-center pt-6">
                        <label class="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData().smtpUseSSL}
                            onChange={(e) => setFormData({ ...formData(), smtpUseSSL: e.currentTarget.checked })}
                            class="w-4 h-4 rounded border-border"
                          />
                          <span class="text-sm text-white">SSL</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={closeForm}
                  class="px-4 py-2 text-muted-foreground hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
                >
                  {editingAccount() ? 'Update' : 'Add'} Account
                </button>
              </div>
            </form>
          </div>
        </div>
      </Show>
    </div>
  )
}
