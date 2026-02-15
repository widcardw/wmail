import { For, Show, createSignal } from 'solid-js'
import { mailStore } from '~/stores/mail'

export default function AccountSwitcher() {
  const [isOpen, setIsOpen] = createSignal(false)

  const handleAccountSelect = (account: any) => {
    mailStore.setCurrentAccount(account)
    setIsOpen(false)
  }

  return (
    <div class="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen())}
        class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface transition-colors"
      >
        <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <span class="text-primary font-medium text-sm">
            {mailStore.state.currentAccount?.email.charAt(0).toUpperCase() || '?'}
          </span>
        </div>
        <Show when={mailStore.state.currentAccount}>
          <span class="text-sm text-white max-w-32 truncate">
            {mailStore.state.currentAccount?.name}
          </span>
        </Show>
        <div class={`i-ri-arrow-down-s-line w-4 h-4 text-muted-foreground transition-transform ${isOpen() ? 'rotate-180' : ''}`} />
      </button>

      <Show when={isOpen()}>
        <div class="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg overflow-hidden z-10">
          <div class="p-2">
            <div class="px-3 py-1 text-xs font-medium text-muted-foreground mb-1">
              账户
            </div>
            <For each={mailStore.state.accounts}>
              {(account) => (
                <button
                  type="button"
                  onClick={() => handleAccountSelect(account)}
                  class={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    mailStore.state.currentAccount?.id === account.id
                      ? 'bg-primary/10'
                      : 'hover:bg-surface'
                  }`}
                >
                  <div class="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span class="text-primary font-medium text-xs">
                      {account.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm text-white truncate">{account.name}</div>
                    <div class="text-xs text-muted-foreground truncate">{account.email}</div>
                  </div>
                  <Show when={mailStore.state.currentAccount?.id === account.id}>
                    <div class="i-ri-check-line w-4 h-4 text-primary flex-shrink-0" />
                  </Show>
                </button>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  )
}
