import { Email } from '#/wmail/services'
import { Component, For } from 'solid-js'
import { ScrollArea } from '@ark-ui/solid'
import clsx from 'clsx'
import scrollStyles from '~/components/ui/scroll_area/index.module.css'
import MailAbstract from './mail-abs'

const InboxList: Component<{
  emails: Email[]
  selectedUid: number | undefined
  onEmailSelect: (email: Email) => void
}> = (props) => {
  return (
    <ScrollArea.Root class={clsx(scrollStyles.Root, scrollStyles['with-header'])}>
      <ScrollArea.Viewport class={scrollStyles.Viewport}>
        <ScrollArea.Content class={clsx(scrollStyles.Content)}>
          <For each={props.emails}>
            {(email) => (
              <MailAbstract
                email={email}
                selected={email.uid === props.selectedUid}
                onClick={() => props.onEmailSelect(email)}
              />
            )}
          </For>
        </ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar class={scrollStyles.Scrollbar}>
        <ScrollArea.Thumb class={scrollStyles.Thumb} />
      </ScrollArea.Scrollbar>
      <ScrollArea.Corner class={scrollStyles.Corner} />
    </ScrollArea.Root>
    // <div class="flex-1 h-full">
    //   <For each={props.emails}>
    //     {(email) => (
    //       <MailAbstract
    //         email={email}
    //         selected={email.uid === props.selectedUid}
    //         onClick={() => props.onEmailSelect(email)}
    //       />
    //     )}
    //   </For>
    // </div>
  )
}

export default InboxList
