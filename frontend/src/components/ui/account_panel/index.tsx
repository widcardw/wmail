import { Account } from '#/wmail/services'
import { Collapsible } from '@ark-ui/solid'
import { Component, createMemo, For } from 'solid-js'
import colStyles from './collapsible.module.css'
import { A, useParams } from '@solidjs/router'
import mailStore from '~/stores/mail'
import { foldersToPanel, type PanelItem } from '~/utils/folder'

interface MailCateCounts {
  inbox: number
  sent: number
  trash: number
  drafts: number
  spam: number
  archive: number
}

const AccountPanel: Component<{
  account: Account
  activeFolder?: string
}> = (props) => {
  const params = useParams()
  const folders = createMemo(() => foldersToPanel(props.account.folders || []))

  // 判断是否应该展开：当前路由的账户ID匹配
  const isExpanded = () => {
    return mailStore.state.expandedAccounts[props.account.id] === true
  }

  const toggleExpanded = () => {
    mailStore.toggleAccountExpanded(props.account.id)
  }

  // 判断文件夹是否激活：当前账户ID + 文件夹path都匹配
  const isActiveFolder = (folderPath: string) => {
    return params.id === props.account.id && props.activeFolder === folderPath
  }

  // 递归渲染文件夹（包含子文件夹）
  const renderFolder = (folder: PanelItem, level: number = 0) => (
    <div>
      <A
        href={`/mailbox2/${props.account.id}/${folder.path}`}
        class={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors no-underline ${
          isActiveFolder(folder.path)
            ? 'bg-primary-hvbg text-primary'
            : 'text-text hover:text-primary'
        }`}
        style={level > 0 ? `padding-left: ${level * 12 + 12}px` : ''}
      >
        <div class={`${folder.icon} w-4 h-4`} />
        <span class="flex-1 min-w-0 truncate">{folder.name}</span>
        {folder.unread > 0 && (
          <span class="text-xs bg-primary text-white px-1.5 py-0.5 rounded-full">
            {folder.unread}
          </span>
        )}
      </A>
      {folder.children.length > 0 && (
        <div class="space-y-1">
          <For each={folder.children}>
            {(child) => renderFolder(child, level + 1)}
          </For>
        </div>
      )}
    </div>
  )

  return (
    <Collapsible.Root class={colStyles.Root} open={isExpanded()} onOpenChange={toggleExpanded}>
      <Collapsible.Trigger class={colStyles.Trigger}>
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <div class="flex-1 min-w-0">
            <div class="font-700 truncate" title={props.account.email}>
              {props.account.name || props.account.email}
            </div>
          </div>
        </div>
        <Collapsible.Indicator class={colStyles.Indicator}>
          <div class="i-ri-arrow-right-s-line w-5 h-5" />
        </Collapsible.Indicator>
      </Collapsible.Trigger>
      <Collapsible.Content class={colStyles.Content}>
        <div class={colStyles.Body}>
          <div class="space-y-1">
            {folders().length > 0 ? (
              <For each={folders()}>
                {(folder) => renderFolder(folder)}
              </For>
            ) : (
              <div class="px-3 py-2 text-sm text-text-muted">No folders</div>
            )}
          </div>
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

export { AccountPanel, type MailCateCounts }
