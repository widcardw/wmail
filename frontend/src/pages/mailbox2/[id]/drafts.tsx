import MailBoxLayout from '~/components/layouts/mailboxlayout'

export default function DraftsPage() {
  return (
    <MailBoxLayout activeFolder="drafts">
      <div class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <div class="i-ri-file-text-line w-20 h-20 text-muted-foreground mx-auto mb-4" />
          <h3 class="text-xl font-semibold text-white mb-2">Drafts</h3>
          <p class="text-muted-foreground">Drafts page - Coming soon</p>
        </div>
      </div>
    </MailBoxLayout>
  )
}
