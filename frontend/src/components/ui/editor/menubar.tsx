import { Component, createMemo } from "solid-js";
import { type Editor } from "@tiptap/core";
// import { menubarStateAccessor } from '~/components/ui/editor/menubar-state'
import clsx from "clsx";

import "./menubar.scss";
import { createEditorTransaction } from "solid-tiptap";
import { Menu, Toggle } from "@ark-ui/solid";
import menuStyles from "~/components/ui/menu/index.module.css";
import toggleStyles from "~/components/ui/toggle/index.module.css";
import { Button } from "../button";

const HEAD_MAP = {
  'p': 'i-ri-paragraph',
  'h1': 'i-lucide-heading-1',
  'h2': 'i-lucide-heading-2',
  'h3': 'i-lucide-heading-3',
  'h4': 'i-lucide-heading-4',
  'h5': 'i-lucide-heading-5',
  'h6': 'i-lucide-heading-6',
  'null': 'i-ri-close-fill',
}

const EditorMenubar: Component<{ editor?: Editor }> = (props) => {
  if (!props.editor) {
    return null;
  }

  const state = createEditorTransaction(
    () => props.editor,
    (editor) => ({
      isBold: editor?.isActive("bold"),
      canBold: editor?.can().chain().focus().toggleBold().run(),
      isItalic: editor?.isActive("italic"),
      canItalic: editor?.can().chain().focus().toggleItalic().run(),
      isStrike: editor?.isActive("strike"),
      canStrike: editor?.can().chain().focus().toggleStrike().run(),
      isCode: editor?.isActive("code"),
      canCode: editor?.can().chain().focus().toggleCode().run(),
      isUnderline: editor?.isActive("underline"),
      canUnderline: editor?.can().chain().focus().toggleUnderline().run(),
      isParagraph: editor?.isActive("paragraph"),
      isHeading1: editor?.isActive("heading", { level: 1 }),
      isHeading2: editor?.isActive("heading", { level: 2 }),
      isHeading3: editor?.isActive("heading", { level: 3 }),
      isHeading4: editor?.isActive("heading", { level: 4 }),
      isHeading5: editor?.isActive("heading", { level: 5 }),
      isHeading6: editor?.isActive("heading", { level: 6 }),
      isBulletList: editor?.isActive("bulletList"),
      isOrderedList: editor?.isActive("orderedList"),
      isCodeBlock: editor?.isActive("codeBlock"),
      isBlockquote: editor?.isActive("blockquote"),
      canUndo: editor?.can().chain().focus().undo().run(),
      canRedo: editor?.can().chain().focus().redo().run(),
    }),
  );

  const headState = createMemo(() => {
    return state().isParagraph
      ? "p"
      : state().isHeading1
        ? "h1"
        : state().isHeading2
          ? "h2"
          : state().isHeading3
            ? "h3"
            : state().isHeading4
              ? "h4"
              : state().isHeading5
                ? "h5"
                : state().isHeading6
                  ? "h6"
                  : 'null';
  });

  return (
    <div
      class="control-group h-3rem flex items-center gap-1 px-1"
      style={{ "border-bottom": "1px solid var(--color-border)" }}
    >
      <Button
        variant="ghost"
        size="icon"
        title="Undo"
        onClick={() => props.editor!.chain().focus().undo().run()}
        disabled={!state().canUndo}
      >
        <div class="i-ri-arrow-go-back-fill w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title="Redo"
        onClick={() => props.editor!.chain().focus().redo().run()}
        disabled={!state().canRedo}
      >
        <div class="i-ri-arrow-go-forward-fill w-4 h-4" />
      </Button>
      <div
        class="h-5"
        style={{ "border-right": "1px solid var(--color-border)" }}
      />
      <Toggle.Root
        pressed={state().isBold}
        onPressedChange={() => props.editor!.chain().focus().toggleBold().run()}
        title="Bold"
        disabled={!state().canBold}
        class={clsx(toggleStyles.Root)}
      >
        <div class="i-ri-bold w-4 h-4"></div>
      </Toggle.Root>
      <Toggle.Root
        pressed={state().isItalic}
        onPressedChange={() =>
          props.editor!.chain().focus().toggleItalic().run()
        }
        title="Italic"
        disabled={!state().canItalic}
        class={clsx(toggleStyles.Root)}
      >
        <div class="i-ri-italic w-4 h-4"></div>
      </Toggle.Root>
      <Toggle.Root
        pressed={state().isStrike}
        onPressedChange={() =>
          props.editor!.chain().focus().toggleStrike().run()
        }
        title="Strike"
        disabled={!state().canStrike}
        class={clsx(toggleStyles.Root)}
      >
        <div class="i-ri-strikethrough w-4 h-4"></div>
      </Toggle.Root>
      <Toggle.Root
        pressed={state().isUnderline}
        onPressedChange={() =>
          props.editor!.chain().focus().toggleUnderline().run()
        }
        title="Underline"
        disabled={!state().canUnderline}
        class={clsx(toggleStyles.Root)}
      >
        <div class="i-ri-underline w-4 h-4"></div>
      </Toggle.Root>
      <Toggle.Root
        pressed={state().isCode}
        onPressedChange={() => props.editor!.chain().focus().toggleCode().run()}
        disabled={!state().canCode}
        title="Inline Code"
        class={clsx(toggleStyles.Root, state().isCode && "is-active")}
      >
        <div class="i-ri-code-s-slash-line w-4 h-4"></div>
      </Toggle.Root>

      <Button
        variant="ghost"
        size="icon"
        title="Clear Style"
        onClick={() => props.editor!.chain().focus().unsetAllMarks().run()}
      >
        <div class="i-ri-eraser-line w-4 h-4" />
      </Button>
      <div
        class="h-5"
        style={{ "border-right": "1px solid var(--color-border)" }}
      />
      <Menu.Root>
        <Menu.Trigger class={menuStyles.Trigger} title="Heading">
          <div class={clsx('w-4 h-4', HEAD_MAP[headState()!])} />
          <Menu.Indicator class={menuStyles.Indicator}>
            <div class="i-ri-arrow-down-s-line" />
          </Menu.Indicator>
        </Menu.Trigger>
        <Menu.Positioner>
          <Menu.Content class={menuStyles.Content}>
            <Menu.Arrow class={menuStyles.Arrow}>
              <Menu.ArrowTip class={menuStyles.ArrowTip} />
            </Menu.Arrow>
            <Menu.Item class={menuStyles.Item} value="p" onClick={() => props.editor!.chain().focus().setParagraph().run()}>
              <div class="i-ri-paragraph w-4 h-4" /> Paragraph
            </Menu.Item>
            <Menu.Item class={menuStyles.Item} value="h1" onClick={() => props.editor!.chain().focus().toggleHeading({ level: 1 }).run()}>
              <div class="i-lucide-heading-1 w-4 h-4" /> Heading 1
            </Menu.Item>
            <Menu.Item class={menuStyles.Item} value="h2" onClick={() => props.editor!.chain().focus().toggleHeading({ level: 2 }).run()}>
              <div class="i-lucide-heading-2 w-4 h-4" /> Heading 2
            </Menu.Item>
            <Menu.Item class={menuStyles.Item} value="h3" onClick={() => props.editor!.chain().focus().toggleHeading({ level: 3 }).run()}>
              <div class="i-lucide-heading-3 w-4 h-4" /> Heading 3
            </Menu.Item>
            <Menu.Item class={menuStyles.Item} value="h4" onClick={() => props.editor!.chain().focus().toggleHeading({ level: 4 }).run()}>
              <div class="i-lucide-heading-4 w-4 h-4" /> Heading 4
            </Menu.Item>
            <Menu.Item class={menuStyles.Item} value="h5" onClick={() => props.editor!.chain().focus().toggleHeading({ level: 5 }).run()}>
              <div class="i-lucide-heading-5 w-4 h-4" /> Heading 5
            </Menu.Item>
            <Menu.Item class={menuStyles.Item} value="h6" onClick={() => props.editor!.chain().focus().toggleHeading({ level: 6 }).run()}>
              <div class="i-lucide-heading-6 w-4 h-4" /> Heading 6
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Menu.Root>
      <Button
        variant="ghost"
        size="icon"
        title="Bullet List"
        onClick={() => props.editor!.chain().focus().toggleBulletList().run()}
        class={clsx(state().isBulletList && "is-active")}
      >
        <div class="i-ri-list-check w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title="Ordered List"
        onClick={() => props.editor!.chain().focus().toggleOrderedList().run()}
        class={clsx(state().isOrderedList && "is-active")}
      >
        <div class="i-ri-list-ordered-2 w-4 h-4" />
      </Button>
      <Toggle.Root
        pressed={state().isCodeBlock}
        onPressedChange={() =>
          props.editor!.chain().focus().toggleCodeBlock().run()
        }
        title="Code Block"
        class={toggleStyles.Root}
      >
        <div class="i-ri-code-block w-4 h-4" />
      </Toggle.Root>
      <Toggle.Root
        pressed={state().isBlockquote}
        onPressedChange={() =>
          props.editor!.chain().focus().toggleBlockquote().run()
        }
        title="Block Quote"
        class={toggleStyles.Root}
      >
        <div class="i-ri-double-quotes-l w-4 h-4" />
      </Toggle.Root>
      <Button
        variant="ghost"
        size="icon"
        title="Clear Node Style"
        onClick={() => props.editor!.chain().focus().clearNodes().run()}
      >
        <div class="i-ri-eraser-fill w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title="Horizontal Rule"
        onClick={() => props.editor!.chain().focus().setHorizontalRule().run()}
      >
        <div class="i-lucide-separator-horizontal w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title="Hard Break"
        onClick={() => props.editor!.chain().focus().setHardBreak().run()}
      >
        <div class="i-ri-text-wrap w-4 h-4" />
      </Button>
    </div>
  );
};

export default EditorMenubar;
