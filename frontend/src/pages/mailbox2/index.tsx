import { Show } from "solid-js";
import { A } from "@solidjs/router";
import { mailStore } from "~/stores/mail";
import MailBoxLayout from "~/components/layouts/mailboxlayout";

export default function Mailbox2Page() {
  const accounts = () => mailStore.state.accounts;

  return (
    <MailBoxLayout>
      <div class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <div class="i-ri-mail-open-line w-20 h-20 text-muted-foreground mx-auto mb-4" />
          <h3 class="text-xl font-semibold text-white mb-2">
            Welcome to Mailbox
          </h3>
          <p class="text-muted-foreground mb-4">
            Select an account and folder to view your emails
          </p>
          <Show when={accounts().length === 0}>
            <A
              href="/accounts"
              class="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
            >
              Add your first account
            </A>
          </Show>
        </div>
      </div>
    </MailBoxLayout>
  );
}
