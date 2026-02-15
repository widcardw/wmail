import { Component, JSXElement, Show } from 'solid-js'
import clsx from 'clsx'
// import { goos } from "~/stores/os";
import { A } from '@solidjs/router'

import styles from './baselayout.module.css'
import mailStore from '~/stores/mail'
import { createMemo } from 'solid-js'

const BaseLayout: Component<{ children: JSXElement }> = (props) => {
  const hasAccount = createMemo(() => mailStore.state.accounts.length > 0)
  return (
    <div class="min-h-screen w-full bg-bg flex flex-col">
      <div class={styles.Titlebar}>TitleBar</div>
      <div class="flex flex-1">
        <nav class={styles.Nav}>
          <A href="/" title="Home" class={styles.Link}>
            <div class="i-ri-home-2-line w-5 h-5" />
          </A>
          <A href="/account" title="Accounts" class={styles.Link}>
            <div class="i-ri-account-circle-line w-5 h-5" />
          </A>

          <Show when={hasAccount()}>
            <A href="/mailbox" title="Mailbox" class={styles.Link}>
              <div class="i-ri-mail-line w-5 h-5" />
            </A>
            <A href="/compose" title="Compose" class={styles.Link}>
              <div class="i-ri-pen-nib-fill w-5 h-5" />
            </A>
          </Show>

          <A href="/settings" title="Setting" class={styles.Link}>
            <div class="i-ri-settings-2-line w-5 h-5" />
          </A>
        </nav>
        <main class={clsx('flex-1', 'bg-bg')}>{props.children}</main>
      </div>
    </div>
  )
}

export default BaseLayout
