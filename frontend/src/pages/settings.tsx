import { Field, RadioGroup } from '@ark-ui/solid'
import { For, onMount } from 'solid-js'
import { configStore as cs, setConfigStore } from '~/stores/app'
import { changeTheme } from '~/utils/theme'
import { NoteService } from '#/wmail/services'
import radioStyles from '~/components/ui/radio/index.module.css'
import fieldStyles from '~/components/ui/fields/field.module.css'
import clsx from 'clsx'
import { Button } from '~/components/ui/button'
import { Dialogs } from '@wailsio/runtime'
import { toaster } from '~/components/ui/toaster'

export default function SettingsPage() {
  const themeChoices = ['auto', 'light', 'dark']

  onMount(async () => {
    try {
      const config = await NoteService.GetConfig()
      setConfigStore('notesConfig', {
        defaultDir: config.defaultDir,
      })
    } catch (error) {
      console.error('Failed to load notes config:', error)
    }
  })

  function handleThemeChange(t: 'auto' | 'light' | 'dark') {
    setConfigStore('theme', t)
    changeTheme(t)
  }

  async function handleDefaultPathChoose() {
    // This would need to be implemented with a backend call to open directory picker
    // For now, just show a message
    // alert('Please implement directory picker in backend (OsService.SelectDirectory)')
    try {
      const selectedPath = await Dialogs.OpenFile({
        AllowsMultipleSelection: false,
        CanChooseDirectories: true,
        CanChooseFiles: false,
        Directory: cs.notesConfig.defaultDir,
      })
      if (selectedPath.trim() !== '') {
        setConfigStore('notesConfig', 'defaultDir', selectedPath)
        // setConfigChanged(true)
      }
    } catch (e) {
      toaster.create({
        title: 'Error',
        description: 'Failed to select path! ' + String(e),
        type: 'error',
      })
    }
  }

  async function handleDefaultPathChange(path: string) {
    setConfigStore('notesConfig', 'defaultDir', path)
    try {
      await NoteService.SetDefaultDir(path)
    } catch (error) {
      console.error('Failed to update default path:', error)
    }
  }

  return (
    <div class="p-4 min-w-600px max-w-800px mx-auto space-y-4">
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
      <Field.Root class={fieldStyles.Root}>
        <Field.Label class={fieldStyles.Label}>Notes Default Directory</Field.Label>
        <div class="flex gap-4 w-full">
          <Field.Input
            class={clsx(fieldStyles.Input, "font-mono text-sm flex-1")}
            value={cs.notesConfig.defaultDir}
            onInput={(v) => handleDefaultPathChange(v.target.value)}
          />
          <Button onClick={handleDefaultPathChoose}>Choose</Button>
        </div>
        <Field.HelperText class={fieldStyles.HelperText}>The default path to save your notes</Field.HelperText>
      </Field.Root>
    </div>
  )
}
