import { Component, For, JSXElement } from "solid-js";
import clsx from "clsx";
// import { goos } from "~/stores/os";
import { A } from "@solidjs/router";

import styles from "./baselayout.module.css";
import mailStore from "~/stores/mail";
import { createMemo } from "solid-js";
import { Tooltip } from "@ark-ui/solid";
import { Portal } from "solid-js/web";
import tooltipStyles from '~/components/ui/tooltip/index.module.css'

const BaseLayout: Component<{ children: JSXElement }> = (props) => {
  const hasAccount = createMemo(() => mailStore.state.accounts.length > 0);

  const buttons = createMemo(() => [
    { title: "Home", href: "/", icon: "ri-home-2-line", condition: true },
    {
      title: "Accounts",
      href: "/accounts",
      icon: "ri-account-circle-line",
      condition: true,
    },
    {
      title: "Mailbox",
      href: "/mailbox2",
      icon: "ri-mail-line",
      condition: hasAccount(),
    },
    {
      title: "Compose",
      href: "/compose",
      icon: "ri-pen-nib-fill",
      condition: hasAccount(),
    },
    {
      title: "Settings",
      href: "/settings",
      icon: "ri-settings-2-line",
      condition: true,
    },
  ]);

  return (
    <div class="min-h-screen w-full bg-bg flex flex-col">
      <div class={styles.Titlebar}>TitleBar</div>
      <div class="flex flex-1">
        <nav class={styles.Nav}>
          <For each={buttons().filter((i) => i.condition)}>
            {(b) => (
              <Tooltip.Root
                closeDelay={0}
                openDelay={0}
                positioning={{
                  placement: "right-start",
                  offset: {'mainAxis': 10}
                }}
              >
                <Tooltip.Trigger class="p-0">
                  <A href={b.href} title={b.title} class={styles.Link}>
                    <div class={clsx("w-5 h-5", `i-${b.icon}`)} />
                  </A>
                </Tooltip.Trigger>
                <Portal>
                  <Tooltip.Positioner>
                    <Tooltip.Content class={tooltipStyles.Content}>
                      {b.title}
                    </Tooltip.Content>
                  </Tooltip.Positioner>
                </Portal>
              </Tooltip.Root>
            )}
          </For>
        </nav>
        <main class={clsx("flex-1", "bg-bg")}>{props.children}</main>
      </div>
    </div>
  );
};

export default BaseLayout;
