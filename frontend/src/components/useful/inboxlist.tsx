import { Email } from "#/wmail/services";
import { Component, For } from "solid-js";
import { ScrollArea } from '@ark-ui/solid'
import clsx from 'clsx'
import scrollStyles from "~/components/ui/scroll_area/index.module.css";
import { formatDate } from '~/utils/date'

const InboxList: Component<{ emails: Email[] }> = (props) => {
  return (
    <ScrollArea.Root class={scrollStyles.Root} style="min-height: 0;">
      <ScrollArea.Viewport class={scrollStyles.Viewport} style="min-height: 0;">
        <ScrollArea.Content class={clsx(scrollStyles.Content, "h-full")}>
          <For each={props.emails}>
            {(email) => (
              <div class="px-6 py-4 cursor-pointer" style={{ 'border-bottom': '1px solid var(--color-border)' }}>
                <div class="flex items-start gap-4">
                  <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <span class="text-primary-fg font-semibold">
                      {email.from.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between mb-1">
                      <span class={`font-semibold truncate ${!email.isRead ? 'font-700' : 'text-muted-foreground'}`}>
                        {email.from}
                      </span>
                      <span class="text-sm text-muted-foreground shrink-0 ml-2">
                        {formatDate(email.date)}
                      </span>
                    </div>
                    <h3 class={`text-sm truncate mb-1 ${!email.isRead ? 'font-700' : 'text-muted-foreground'}`}>
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
        </ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar class={scrollStyles.Scrollbar}>
        <ScrollArea.Thumb class={scrollStyles.Thumb} />
      </ScrollArea.Scrollbar>
      <ScrollArea.Corner class={scrollStyles.Corner} />
    </ScrollArea.Root>
  )
}

export default InboxList
