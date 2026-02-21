import { Component, JSXElement, onMount } from "solid-js";
import mailStore from "~/stores/mail";
import { AccountPanel } from "../ui/account_panel";
import scrollStyles from "~/components/ui/scroll_area/index.module.css";
import { ScrollArea, Splitter } from "@ark-ui/solid";
import clsx from "clsx";
import { useParams } from "@solidjs/router";

const MailBoxLayout: Component<{
  children: JSXElement;
  activeFolder?: string;
}> = (props) => {
  const params = useParams();

  // 初始化当前路由对应的账号为展开状态
  onMount(() => {
    if (params.id) {
      mailStore.setAccountExpanded(params.id, true);
    }
  });

  return (
    <div class="flex flex-col h-screen overflow-hidden">
      <Splitter.Root
        class="flex h-screen"
        panels={[{ id: "account" }, { id: "mailbox" }]}
        defaultSize={[1, 3]}
      >
        {/* 左侧 - 账户列表 */}
        <Splitter.Panel id="account" class="min-w-24">
          <ScrollArea.Root class={scrollStyles.Root}>
            <ScrollArea.Viewport class={scrollStyles.Viewport}>
              <ScrollArea.Content
                class={clsx(scrollStyles.Content, "p-2 h-full")}
                // style={{ "border-right": "1px solid var(--color-border)" }}
              >
                <div class="flex flex-col gap-2">
                  {mailStore.state.accounts.map((account) => (
                    <AccountPanel
                      account={account}
                      activeFolder={props.activeFolder}
                    />
                  ))}
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
          class="px-1"
          style={{ "border-right": "1px solid var(--color-border)" }}
          id="account:mailbox"
          aria-label="Resize"
        >
          <Splitter.ResizeTriggerIndicator />
        </Splitter.ResizeTrigger>

        <Splitter.Panel
          id="mailbox"
          class="flex flex-col h-full overflow-hidden"
        >
          {props.children}
        </Splitter.Panel>
      </Splitter.Root>
    </div>
  );
};

export default MailBoxLayout;
