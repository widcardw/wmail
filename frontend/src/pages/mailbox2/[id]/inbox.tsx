import { Show, createSignal, onMount } from "solid-js";
import { useParams } from "@solidjs/router";
import { Email, MailService } from "#/wmail/services";
import MailBoxLayout from "~/components/layouts/mailboxlayout";
import InboxList from "~/components/useful/inboxlist";


export default function InboxPage() {
  const params = useParams();
  const [emails, setEmails] = createSignal<Email[]>([]);
  const [loading, setLoading] = createSignal(false);
  
  const [selectedEmail, setSelectedEmail] = createSignal<Email | null>(null)

  onMount(async () => {
    await loadEmails();
  });

  const loadEmails = async () => {
    console.log("loadEmails called, params.id:", params.id);
    if (!params.id) {
      console.warn("No params.id, skipping load");
      return;
    }

    setLoading(true);
    try {
      console.log("Calling GetEmails with:", params.id, "INBOX", 1, 50);
      const result = await MailService.GetEmails(params.id, "INBOX", 1, 50);
      console.log("GetEmails result:", result);
      setEmails(result.filter((e) => e !== null));
    } catch (error) {
      console.error("Failed to load emails:", error);
    }
    setLoading(false);
  };

  return (
    <MailBoxLayout activeFolder="inbox" inbox={
      <div class="w-full h-full flex flex-col">
        <div
          class="p-4 h-3.75rem flex items-center justify-between shrink-0"
          style={{ "border-bottom": "1px solid var(--color-border)" }}
        >
          <h1 class="text-xl font-bold text-text">Inbox</h1>
          <button
            type="button"
            onClick={() => loadEmails()}
            class="p-2 text-text"
            title="Refresh"
          >
            <div class="i-ri-refresh-line w-5 h-5" />
          </button>
        </div>
        <Show when={!loading()} fallback="Loading...">
          <Show when={emails().length > 0} fallback="No emails">
            <InboxList emails={emails()} selectedUid={selectedEmail()?.uid} onEmailSelect={e => setSelectedEmail(e)} />
          </Show>
        </Show>
      </div>
    }>
      <Show when={selectedEmail() !== null} fallback="No email selected">
        <pre>{selectedEmail()!.body}</pre>
      </Show>
    </MailBoxLayout>
  );
}
