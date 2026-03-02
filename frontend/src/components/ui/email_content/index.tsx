import { Email } from '#/wmail/services'
import clsx from 'clsx'
import { Component } from 'solid-js'
import { fullDate } from '~/utils/date'
import { getEmailSender } from '~/utils/email-sender'

const EmailContent: Component<{ email: Email }> = (props) => {
  const sender = props.email.from
  const initials = getEmailSender(sender).slice(0, 2).toUpperCase()

  return (
    <main>
      <header
        class="p-4 flex gap-4 bg-bg"
        style={{ 'border-bottom': '1px solid var(--color-border)' }}
      >
        <div
          class={clsx(
            'w-12 h-12 rounded-full text-primary-fg bg-primary',
            'flex items-center justify-center text-lg font-600 shrink-0',
          )}
        >
          {initials}
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-4">
            <h3 class="text-base font-600 truncate">{sender}</h3>
            <span class="text-sm text-mut-foreground whitespace-nowrap">
              {fullDate(props.email.date)}
            </span>
          </div>
          <div class="text-lg font-500 mt-1 whitespace-break-spaces break-all">
            {props.email.subject}
          </div>
          <div class="text-sm">To: {props.email.to}</div>
        </div>
      </header>
      <pre class="p-4" style="white-space: pre-wrap; word-break: break-word;">
        {props.email.body}
      </pre>
    </main>
  )
}

export default EmailContent
