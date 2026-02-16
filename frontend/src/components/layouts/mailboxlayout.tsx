import { Component, JSXElement, onMount } from "solid-js";
import mailStore from "~/stores/mail";
import { AccountPanel } from "../ui/account_panel";
import scrollStyles from "~/components/ui/scroll_area/index.module.css";
import { ScrollArea } from "@ark-ui/solid";
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
    <div class="flex h-screen">
      {/* 左侧 - 账户列表 */}
      <div class="w-72 shrink-0">
        <ScrollArea.Root class={scrollStyles.Root}>
          <ScrollArea.Viewport class={scrollStyles.Viewport}>
            <ScrollArea.Content
              class={clsx(scrollStyles.Content, "p-2 h-full")}
              style={{ "border-right": "1px solid var(--color-border)" }}
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
      </div>

      {/* 右侧 - 主内容区域 */}
      <div class="flex-1 flex flex-col min-w-0">
        {props.children}
      </div>
    </div>
  );
};

export default MailBoxLayout;
