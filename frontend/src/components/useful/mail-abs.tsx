import { Email } from '#/wmail/services'
import clsx from 'clsx'
import { Component } from 'solid-js'
import { formatDate } from '~/utils/date'
import { getEmailSender } from '~/utils/email-sender'

const MailAbstract: Component<{ email: Email; selected: boolean; onClick: (v: any) => void }> = (
  props,
) => {
  return (
    <div
      class={clsx('p-4 space-y-1 cursor-pointer', props.selected && 'bg-primary-hvbg')}
      style={{ 'border-bottom': '1px solid var(--color-border)' }}
      onClick={props.onClick}
    >
      <div class="flex justify-between items-center">
        <span class="font-700 truncate">{getEmailSender(props.email.from)}</span>
        <span class="text-sm text-mut-foreground">{formatDate(props.email.date)}</span>
      </div>
      <div
        class={clsx(
          'text-sm text-mut-foreground leading-tight',
          'h-2rem of-y-hidden w-full whitespace-break-spaces break-all',
        )}
      >
        {props.email.subject}
      </div>
    </div>
  )
}

export default MailAbstract
