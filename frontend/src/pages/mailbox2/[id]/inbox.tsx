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
  const [loadingBody, setLoadingBody] = createSignal<string | null>(null)

  onMount(async () => {
    await loadEmails();
  });

  const loadEmails = async (forceRefresh = false) => {
    console.log("loadEmails called, params.id:", params.id, "forceRefresh:", forceRefresh);
    if (!params.id) {
      console.warn("No params.id, skipping load");
      return;
    }

    setLoading(true);
    try {
      console.log("Calling GetEmails with:", params.id, "INBOX", 1, 50, forceRefresh);
      const result = await MailService.GetEmails(params.id, "INBOX", 1, 50, forceRefresh);
      console.log("GetEmails result:", result);
      setEmails(result.filter((e) => e !== null));
    } catch (error) {
      console.error("Failed to load emails:", error);
    }
    setLoading(false);
  };

  const loadEmailBody = async (email: Email) => {
    console.log("Loading email body for:", email.uid)
    setLoadingBody(email.uid.toString())
    try {
      const fullEmail = await MailService.GetEmail(params.id!, 'INBOX', email.uid)
      console.log("Got full email:", fullEmail)
      setSelectedEmail(fullEmail)
    } catch (error) {
      console.error("Failed to load email body:", error)
    } finally {
      setLoadingBody(null)
    }
  }

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
            onClick={() => loadEmails(true)}
            class="p-2 text-text"
            title="Refresh"
          >
            <div class="i-ri-refresh-line w-5 h-5" />
          </button>
        </div>
        <Show when={!loading()} fallback="Loading...">
          <Show when={emails().length > 0} fallback="No emails">
            <InboxList emails={emails()} selectedUid={selectedEmail()?.uid} onEmailSelect={e => loadEmailBody(e)} />
          </Show>
        </Show>
      </div>
    }>
      <Show when={selectedEmail() !== null} fallback="No email selected">
        <Show when={loadingBody() === null}>
          <pre style="white-space: pre-wrap; word-break: break-word;">{selectedEmail()!.body}</pre>
        </Show>
        <Show when={loadingBody() !== null}>
          <div class="p-4 text-center">
            <div class="i-ri-loader-4-line w-8 h-8 animate-spin text-primary mx-auto" />
            <p class="text-muted-foreground mt-2">Loading email content...</p>
          </div>
        </Show>
      </Show>
    </MailBoxLayout>
  );
}
