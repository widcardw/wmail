// @unocss-include
import { Account } from '#/wmail/services'
import { Collapsible } from '@ark-ui/solid'
import { Component } from 'solid-js'
import colStyles from './collapsible.module.css'
import { A, useParams } from '@solidjs/router'
import mailStore from '~/stores/mail'

interface MailCateCounts {
  inbox: number
  sent: number
  trash: number
  drafts: number
  spam: number
  archive: number
}

const folders = [
  { id: 'inbox', name: 'Inbox', icon: 'i-ri-inbox-2-line', path: 'inbox' },
  { id: 'sent', name: 'Sent', icon: 'i-ri-send-plane-line', path: 'sent' },
  { id: 'drafts', name: 'Drafts', icon: 'i-ri-draft-line', path: 'drafts' },
  { id: 'spam', name: 'Spam', icon: 'i-ri-spam-2-line', path: 'spam' },
  { id: 'trash', name: 'Trash', icon: 'i-ri-delete-bin-line', path: 'trash' },
]

const AccountPanel: Component<{
  account: Account
  activeFolder?: string
}> = (props) => {
  const params = useParams()

  // 判断是否应该展开：当前路由的账户ID匹配
  const isExpanded = () => {
    return mailStore.state.expandedAccounts[props.account.id] === true
  }

  const toggleExpanded = () => {
    mailStore.toggleAccountExpanded(props.account.id)
  }

  // 判断文件夹是否激活：当前账户ID + 文件夹ID都匹配
  const isActiveFolder = (folderId: string) => {
    return params.id === props.account.id && props.activeFolder === folderId
  }

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
            {folders.map((folder) => (
              <A
                href={`/mailbox2/${props.account.id}/${folder.path}`}
                class={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors no-underline ${
                  isActiveFolder(folder.id)
                    ? 'bg-primary-hvbg text-primary'
                    : 'text-text hover:text-primary'
                }`}
              >
                <div class={`${folder.icon} w-4 h-4`} />
                <span>{folder.name}</span>
              </A>
            ))}
          </div>
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

export { AccountPanel, type MailCateCounts }
