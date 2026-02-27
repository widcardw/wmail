import { Component, For, JSXElement, onMount } from 'solid-js'
import mailStore from '~/stores/mail'
import { AccountPanel } from '../ui/account_panel'
import scrollStyles from '~/components/ui/scroll_area/index.module.css'
import { ScrollArea, Splitter } from '@ark-ui/solid'
import clsx from 'clsx'
import { useParams } from '@solidjs/router'
import splitterStyles from '~/components/ui/splitter/index.module.css'
import mailboxlayoutStyles from './mailboxlayout.module.css'

const MailBoxLayout: Component<{
  inbox: JSXElement
  children: JSXElement
  activeFolder?: string
}> = (props) => {
  const params = useParams()

  // 初始化当前路由对应的账号为展开状态
  onMount(() => {
    if (params.id) {
      mailStore.setAccountExpanded(params.id, true)
    }
  })

  return (
    <div class="flex flex-col h-screen overflow-hidden">
      <Splitter.Root
        class={clsx(splitterStyles.Root, 'flex h-screen')}
        panels={[
          { id: 'account', minSize: 10 },
          { id: 'inboxlist', minSize: 10 },
          { id: 'mailbody', minSize: 30 },
        ]}
        defaultSize={[15, 25, 60]}
      >
        {/* 左侧 - 账户列表 */}
        <Splitter.Panel id="account" class={splitterStyles.Panel}>
          <ScrollArea.Root
            class={clsx(scrollStyles.Root, 'w-full')}
            style={{ height: 'calc(100% - 40px)' }}
          >
            <ScrollArea.Viewport class={scrollStyles.Viewport}>
              <ScrollArea.Content class={clsx(scrollStyles.Content, 'p-2 h-full')}>
                <div class="flex flex-col gap-2">
                  <For each={mailStore.state.accounts}>
                    {(account) => (
                      <AccountPanel account={account} activeFolder={props.activeFolder} />
                    )}
                  </For>
                </div>
              </ScrollArea.Content>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar class={scrollStyles.Scrollbar}>
              <ScrollArea.Thumb class={scrollStyles.Thumb} />
            </ScrollArea.Scrollbar>
            <ScrollArea.Corner class={scrollStyles.Corner} />
          </ScrollArea.Root>
        </Splitter.Panel>
        <Splitter.ResizeTrigger
          class={splitterStyles.ResizeTrigger}
          id="account:inboxlist"
          aria-label="Resize"
        >
          <Splitter.ResizeTriggerIndicator class={splitterStyles.ResizeTriggerIndicator} />
        </Splitter.ResizeTrigger>

        <Splitter.Panel id="inboxlist" class={clsx(splitterStyles.Panel, 'w-full')}>
          {/*{props.children}*/}
          {props.inbox}
        </Splitter.Panel>

        <Splitter.ResizeTrigger
          class={splitterStyles.ResizeTrigger}
          id="inboxlist:mailbody"
          aria-label="Resize"
        >
          <Splitter.ResizeTriggerIndicator class={splitterStyles.ResizeTriggerIndicator} />
        </Splitter.ResizeTrigger>

        <Splitter.Panel id="mailbody" class={clsx(splitterStyles.Panel, 'w-full')}>
          <ScrollArea.Root
            class={clsx(scrollStyles.Root, 'w-full', mailboxlayoutStyles.ScrollMailBody)}
          >
            <ScrollArea.Viewport class={scrollStyles.Viewport}>
              <ScrollArea.Content class={clsx(scrollStyles.Content, 'h-full')}>
                {props.children}
              </ScrollArea.Content>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar class={scrollStyles.Scrollbar}>
              <ScrollArea.Thumb class={scrollStyles.Thumb} />
            </ScrollArea.Scrollbar>
            <ScrollArea.Corner class={scrollStyles.Corner} />
          </ScrollArea.Root>
        </Splitter.Panel>
      </Splitter.Root>
    </div>
  )
}

export default MailBoxLayout
