import MailBoxLayout from '~/components/layouts/mailboxlayout'

export default function SpamPage() {
  return (
    <MailBoxLayout activeFolder="spam">
      <div class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <div class="i-ri-spam-line w-20 h-20 text-muted-foreground mx-auto mb-4" />
          <h3 class="text-xl font-semibold text-white mb-2">Spam</h3>
          <p class="text-muted-foreground">Spam page - Coming soon</p>
        </div>
      </div>
    </MailBoxLayout>
  )
}
