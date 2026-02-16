import { For, Show, createSignal, onMount } from 'solid-js'
import { useParams } from '@solidjs/router'
import { MailService } from '#/wmail/services'
import MailBoxLayout from '~/components/layouts/mailboxlayout'

export default function InboxPage() {
  const params = useParams()
  const [emails, setEmails] = createSignal<any[]>([])
  const [loading, setLoading] = createSignal(false)

  onMount(async () => {
    // await loadEmails()
  })

  const loadEmails = async () => {
    if (!params.id) return
    
    setLoading(true)
    try {
      const result = await MailService.GetEmails(params.id, 'INBOX', 1, 50)
      setEmails(result.filter(e => e !== null))
    } catch (error) {
      console.error('Failed to load emails:', error)
    }
    setLoading(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <MailBoxLayout activeFolder="inbox">
      <div class="flex-1 flex flex-col">
        <div class="p-4 flex items-center justify-between" style={{ 'border-bottom': '1px solid var(--color-border)' }}>
          <h1 class="text-xl font-bold text-white">Inbox</h1>
          <button
            type="button"
            onClick={() => loadEmails()}
            class="p-2 text-muted-foreground hover:text-white hover:bg-surface rounded transition-colors"
            title="Refresh"
          >
            <div class="i-ri-refresh-line w-5 h-5" />
          </button>
        </div>

        <Show
          when={loading()}
          fallback={
            <Show
              when={emails().length > 0}
              fallback={
                <div class="flex-1 flex items-center justify-center">
                  <div class="text-center">
                    <div class="i-ri-mail-line w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p class="text-muted-foreground">No emails in inbox</p>
                  </div>
                </div>
              }
            >
              <div class="flex-1 overflow-y-auto">
                <For each={emails()}>
                  {(email) => (
                    <div class="px-6 py-4 cursor-pointer" style={{ 'border-bottom': '1px solid var(--color-border)' }}>
                      <div class="flex items-start gap-4">
                        <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <span class="text-primary font-semibold">
                            {email.from.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center justify-between mb-1">
                            <span class={`font-semibold truncate ${!email.isRead ? 'text-white' : 'text-muted-foreground'}`}>
                              {email.from}
                            </span>
                            <span class="text-sm text-muted-foreground flex-shrink-0 ml-2">
                              {formatDate(email.date)}
                            </span>
                          </div>
                          <h3 class={`text-sm truncate mb-1 ${!email.isRead ? 'text-white' : 'text-muted-foreground'}`}>
                            {email.subject}
                          </h3>
                          <p class="text-sm text-muted-foreground truncate">
                            {email.body}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          }
        >
          <div class="flex-1 flex items-center justify-center">
            <div class="text-center">
              <div class="i-ri-loader-4-line w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p class="text-muted-foreground">Loading emails...</p>
            </div>
          </div>
        </Show>
      </div>
    </MailBoxLayout>
  )
}
