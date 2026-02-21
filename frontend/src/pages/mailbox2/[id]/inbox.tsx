import { Show, createSignal, onMount } from "solid-js";
import { useParams } from "@solidjs/router";
import { Email, MailService } from "#/wmail/services";
import MailBoxLayout from "~/components/layouts/mailboxlayout";
import InboxList from "~/components/useful/inboxlist";
import { Splitter } from "@ark-ui/solid";

export default function InboxPage() {
  const params = useParams();
  const [emails, setEmails] = createSignal<Email[]>([]);
  const [loading, setLoading] = createSignal(false);

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
    <MailBoxLayout activeFolder="inbox">
      <div class="flex flex-col h-full">
        <div
          class="p-4 flex items-center justify-between shrink-0"
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
              <Splitter.Root
                class="flex w-full h-screen"
                panels={[{ id: "l" }, { id: "b" }]}
              >
                <Splitter.Panel id="l" class="min-w-24">
                  <InboxList emails={emails()} />
                </Splitter.Panel>
                <Splitter.ResizeTrigger
                  class="px-1"
                  style={{ "border-left": "1px solid var(--color-border)" }}
                  id="account:mailbox"
                  aria-label="Resize"
                >
                  <Splitter.ResizeTriggerIndicator />
                </Splitter.ResizeTrigger>
                <Splitter.Panel id="b">
                  Email body
                </Splitter.Panel>
              </Splitter.Root>
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
  );
}
