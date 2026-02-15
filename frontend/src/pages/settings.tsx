import { RadioGroup } from '@ark-ui/solid'
import { For } from 'solid-js'
import { configStore as cs, setConfigStore } from '~/stores/app'
import { changeTheme } from '~/utils/theme'
import radioStyles from '~/components/ui/radio/index.module.css'
import clsx from 'clsx'

export default function SettingsPage() {
  const themeChoices = ['auto', 'light', 'dark']

  function handleThemeChange(t: 'auto' | 'light' | 'dark') {
    setConfigStore('theme', t)
    changeTheme(t)
  }

  return (
    <div class="p-4 min-w-600px max-w-800px mx-auto">
      <RadioGroup.Root
        class={radioStyles.Root}
        value={cs.theme}
        onValueChange={(v) => handleThemeChange(v.value as 'auto' | 'light' | 'dark')}
      >
        <RadioGroup.Label class={clsx(radioStyles.Label, 'flex-1')}>Theme</RadioGroup.Label>
        <For each={themeChoices}>
          {(it) => (
            <RadioGroup.Item class={radioStyles.Item} value={it}>
              <RadioGroup.ItemControl class={radioStyles.ItemControl} />
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemText class={radioStyles.ItemText}>{it}</RadioGroup.ItemText>
            </RadioGroup.Item>
          )}
        </For>
      </RadioGroup.Root>
    </div>
  )
}
