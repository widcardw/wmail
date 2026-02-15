import { Show, createMemo } from 'solid-js'
import { A } from '@solidjs/router'
import { mailStore } from '~/stores/mail'

interface MailLayoutProps {
  children: any
}

export default function MailLayout(props: MailLayoutProps) {
  const hasAccount = createMemo(() => mailStore.state.accounts.length > 0)

  return (
    <div class="flex h-screen bg-background">
      {/* Sidebar */}
      <div class="w-16 border-r border-border bg-surface flex flex-col items-center py-4 gap-2">
        <div class="w-10 h-10 rounded-lg bg-primary flex items-center justify-center mb-4">
          <div class="i-ri-mail-fill w-6 h-6 text-white" />
        </div>

        <A
          href="/accounts"
          class="p-3 rounded-lg text-muted-foreground hover:text-white hover:bg-surface transition-colors"
          title="Accounts"
        >
          <div class="i-ri-user-settings-line w-6 h-6" />
        </A>

        <Show when={hasAccount()}>
          <A
            href="/mailbox"
            class="p-3 rounded-lg text-muted-foreground hover:text-white hover:bg-surface transition-colors"
            title="Mailbox"
          >
            <div class="i-ri-inbox-line w-6 h-6" />
          </A>

          <A
            href="/compose"
            class="p-3 rounded-lg text-muted-foreground hover:text-white hover:bg-surface transition-colors"
            title="Compose"
          >
            <div class="i-ri-edit-line w-6 h-6" />
          </A>
        </Show>
      </div>

      {/* Main Content */}
      <div class="flex-1 overflow-hidden">{props.children}</div>
    </div>
  )
}
