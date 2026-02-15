import { createSignal } from 'solid-js'

export default function ComposePage() {
  const [formData, setFormData] = createSignal({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
  })

  const handleSend = async () => {
    // TODO: Implement email sending
    console.log('Sending email:', formData())
  }

  return (
    <div class="p-6 h-screen flex flex-col">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-white">New Message</h1>
        <button type="button" class="text-muted-foreground hover:text-white transition-colors">
          <div class="i-ri-close-line w-6 h-6" />
        </button>
      </div>

      <form class="flex-1 flex flex-col gap-4">
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <label class="w-16 text-sm text-muted-foreground">To</label>
            <input
              type="email"
              value={formData().to}
              onInput={(e) => setFormData({ ...formData(), to: e.currentTarget.value })}
              placeholder="recipient@example.com"
              class="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div class="flex items-center gap-2">
            <label class="w-16 text-sm text-muted-foreground">Cc</label>
            <input
              type="email"
              value={formData().cc}
              onInput={(e) => setFormData({ ...formData(), cc: e.currentTarget.value })}
              placeholder="cc@example.com"
              class="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div class="flex items-center gap-2">
            <label class="w-16 text-sm text-muted-foreground">Bcc</label>
            <input
              type="email"
              value={formData().bcc}
              onInput={(e) => setFormData({ ...formData(), bcc: e.currentTarget.value })}
              placeholder="bcc@example.com"
              class="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div class="flex items-center gap-2">
            <label class="w-16 text-sm text-muted-foreground">Subject</label>
            <input
              type="text"
              value={formData().subject}
              onInput={(e) => setFormData({ ...formData(), subject: e.currentTarget.value })}
              placeholder="Email subject"
              class="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div class="flex-1 flex flex-col gap-4">
          <textarea
            value={formData().body}
            onInput={(e) => setFormData({ ...formData(), body: e.currentTarget.value })}
            placeholder="Write your message here..."
            class="flex-1 px-4 py-3 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        <div class="flex items-center justify-between">
          <div class="flex gap-2">
            <button
              type="button"
              class="p-2 text-muted-foreground hover:text-white hover:bg-surface rounded transition-colors"
              title="Attach files"
            >
              <div class="i-ri-attachment-line w-5 h-5" />
            </button>
            <button
              type="button"
              class="p-2 text-muted-foreground hover:text-white hover:bg-surface rounded transition-colors"
              title="Insert link"
            >
              <div class="i-ri-link-line w-5 h-5" />
            </button>
            <button
              type="button"
              class="p-2 text-muted-foreground hover:text-white hover:bg-surface rounded transition-colors"
              title="Insert image"
            >
              <div class="i-ri-image-line w-5 h-5" />
            </button>
          </div>

          <div class="flex gap-3">
            <button
              type="button"
              class="px-4 py-2 text-muted-foreground hover:text-white transition-colors"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={handleSend}
              class="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <div class="i-ri-send-plane-fill w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
