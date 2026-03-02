import { Dialog } from '@ark-ui/solid/dialog'
import { createSignal, For, onMount, Show } from 'solid-js'
import { Portal } from 'solid-js/web'
import { Button } from '~/components/ui/button'
import { Field, Fieldset, Switch as Switcher } from '@ark-ui/solid'
import { mailStore } from '~/stores/mail'

import buttonStyles from '~/components/ui/button/index.module.css'
import dialogStyles from '~/components/ui/dialog/index.module.css'
import fieldStyles from '~/components/ui/fields/field.module.css'
import fieldSetStyles from '~/components/ui/fields/fieldset.module.css'
// import tabStyles from "~/components/ui/tabs/index.module.css";
import switcherStyles from '~/components/ui/switcher/index.module.css'
import accTabStyles from '~/components/ui/accounts_table/index.module.css'

import clsx from 'clsx'
import { createStore } from 'solid-js/store'
import { Account } from '#/wmail/services'
import { toaster } from '~/components/ui/toaster'

import { Dialogs as WailsDialogs } from '@wailsio/runtime'

export default function AccountPage() {
  const [dlgOpen, setDlgOpen] = createSignal(false)
  const [editingAccount, setEditingAccount] = createSignal<Account | null>(null)

  onMount(() => {
    if (mailStore.state.accounts.length === 0) {
      mailStore.loadAccounts()
    }
  })

  const [formData, setFormData] = createStore({
    name: '',
    email: '',
    imapHost: '',
    imapPort: 993,
    imapUseSSL: true,
    smtpHost: '',
    smtpPort: 465,
    smtpUseSSL: true,
    username: '',
    password: '',
  })

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      imapHost: '',
      imapPort: 993,
      imapUseSSL: true,
      smtpHost: '',
      smtpPort: 465,
      smtpUseSSL: true,
      username: '',
      password: '',
    })
  }

  const openAddForm = () => {
    setEditingAccount(null)
    resetForm()
    setDlgOpen(true)
  }

  const closeForm = () => {
    setDlgOpen(false)
    setEditingAccount(null)
    resetForm()
  }

  const handleEdit = (account: Account) => {
    setEditingAccount(account)
    setFormData({
      name: account.name,
      email: account.email,
      imapHost: account.imapHost,
      imapPort: account.imapPort,
      imapUseSSL: account.imapUseSSL,
      smtpHost: account.smtpHost,
      smtpPort: account.smtpPort,
      smtpUseSSL: account.smtpUseSSL,
      username: account.username,
      password: account.password,
    })
    setDlgOpen(true)
  }

  const handleSubmit = async (e: Event) => {
    console.log(formData)
    e.preventDefault()
    try {
      if (editingAccount()) {
        await mailStore.updateAccount({
          ...editingAccount()!,
          ...formData,
        })
      } else {
        await mailStore.addAccount({ ...formData, folders: [] })
      }
      toaster.success({
        title: `Successfully added account ${formData.email}`,
      })
      setDlgOpen(false)
      setEditingAccount(null)
      resetForm()
    } catch (error) {
      toaster.error({
        title: 'Failed to save account',
        description: String(error),
      })
      console.error(error)
    }
  }

  const handleDelete = async (accountId: string, email: string) => {
    const answer = await WailsDialogs.Warning({
      Title: 'Are you sure?',
      Message: `You are going to delete ${email}!`,
      Buttons: [
        { Label: 'Cancel', IsCancel: true, IsDefault: true },
        { Label: 'Delete Account', IsCancel: false, IsDefault: false },
      ],
    })
    console.log(answer)
    if (answer === 'Delete Account') {
      await mailStore.deleteAccount(accountId) // 这里可能有点问题
    }
  }

  return (
    <div class="p-4 min-w-600px">
      <div class="flex justify-between">
        <h3>Accounts</h3>
        <Button size="sm" onClick={openAddForm}>
          Add
        </Button>
      </div>

      <Show when={!mailStore.state.loading} fallback="Loading...">
        <Show
          when={mailStore.state.accounts.length > 0}
          fallback={
            <div class="text-center">
              <h3>No accounts here</h3>
              <p>
                <Button onClick={openAddForm}>Add your first email</Button>
              </p>
            </div>
          }
        >
          <table class={accTabStyles.Root}>
            <thead class={accTabStyles.Thead}>
              <tr>
                <th>Display Name</th>
                <th>Email</th>
                <th>IMAP</th>
                <th>SMTP</th>
                <th>Operation</th>
              </tr>
            </thead>
            <tbody class={accTabStyles.Tbody}>
              <For each={mailStore.state.accounts}>
                {(account) => (
                  <tr>
                    <td>{account.name || account.email}</td>
                    <td>{account.email}</td>
                    <td class="font-mono">
                      {account.imapHost}:{account.imapPort}
                    </td>
                    <td class="font-mono">
                      {account.smtpHost}:{account.smtpPort}
                    </td>
                    <td class="flex gap-2">
                      <a
                        class="text-primary hover:text-primary-hover underline cursor-pointer"
                        onClick={() => handleEdit(account)}
                      >
                        <div class="i-ri-edit-line w-5 h-5" />
                      </a>
                      <a
                        class="text-destructive hover:text-destructive-hover underline cursor-pointer"
                        onClick={() => handleDelete(account.id, account.email)}
                      >
                        <div class="i-ri-delete-bin-line w-5 h-5" />
                      </a>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </Show>
      </Show>

      <Dialog.Root
        open={dlgOpen()}
        onOpenChange={(e) => setDlgOpen(e.open)}
        closeOnInteractOutside={false}
        onExitComplete={closeForm}
      >
        <Portal>
          <Dialog.Backdrop class={dialogStyles.Backdrop} />
          <Dialog.Positioner class={dialogStyles.Positioner}>
            <Dialog.Content
              class={dialogStyles.Content}
              style={{ 'max-height': 'min(48rem, calc(100vh - 4rem))' }}
            >
              <Dialog.CloseTrigger class={dialogStyles.CloseTrigger}>
                <div class="i-ri-close-large-fill w-4 h-4" />
              </Dialog.CloseTrigger>
              <Dialog.Title class={dialogStyles.Title}>Add New Account</Dialog.Title>
              {/*<Dialog.Description class={dialogStyles.Description}>
                Supports IMAP or SMTP.
              </Dialog.Description>*/}
              <div class={clsx(dialogStyles.ScrollContainer, 'w-full')}>
                <Fieldset.Root class={clsx(fieldSetStyles.Root, 'w-full')}>
                  <Field.Root class={fieldStyles.Root}>
                    <Field.Label class={fieldStyles.Label}>Display Name</Field.Label>
                    <Field.Input
                      class={fieldStyles.Input}
                      placeholder="Enter the display name of this account"
                      value={formData.name}
                      onInput={(e) => setFormData('name', e.target.value)}
                      autoCapitalize="off"
                    />
                  </Field.Root>

                  <div class="flex gap-4">
                    <Field.Root class={fieldStyles.Root}>
                      <Field.Label class={fieldStyles.Label}>Email</Field.Label>
                      <Field.Input
                        class={fieldStyles.Input}
                        placeholder="Enter the email address"
                        value={formData.email}
                        onInput={(e) => setFormData('email', e.target.value)}
                        autoCapitalize="off"
                      />
                    </Field.Root>

                    <Field.Root class={fieldStyles.Root}>
                      <Field.Label class={fieldStyles.Label}>Password</Field.Label>
                      <Field.Input
                        class={fieldStyles.Input}
                        placeholder="Enter the password"
                        type="password"
                        value={formData.password}
                        onInput={(e) => setFormData('password', e.target.value)}
                      />
                    </Field.Root>
                  </div>

                  <div class="grid gap-4 grid-cols-2">
                    <Field.Root class={fieldStyles.Root}>
                      <Field.Label class={fieldStyles.Label}>IMAP Host</Field.Label>
                      <Field.Input
                        class={fieldStyles.Input}
                        value={formData.imapHost}
                        onInput={(e) => setFormData('imapHost', e.target.value)}
                        autoCapitalize="off"
                      />
                    </Field.Root>
                    <div class="grid grid-cols-2 gap-4">
                      <Field.Root class={fieldStyles.Root}>
                        <Field.Label class={fieldStyles.Label}>IMAP Port</Field.Label>
                        <Field.Input
                          type="number"
                          value={formData.imapPort}
                          onInput={(e) => setFormData('imapPort', Number(e.target.value))}
                          class={fieldStyles.Input}
                          autoCapitalize="off"
                        />
                      </Field.Root>
                      <Field.Root class={fieldStyles.Root}>
                        <Field.Label class={fieldStyles.Label}>IMAP SSL</Field.Label>
                        <Switcher.Root
                          class={switcherStyles.Root}
                          checked={formData.imapUseSSL}
                          onCheckedChange={(e) => setFormData('imapUseSSL', e.checked)}
                        >
                          <Switcher.Control class={switcherStyles.Control}>
                            <Switcher.Thumb class={switcherStyles.Thumb} />
                          </Switcher.Control>
                          {/*<Switcher.Label class={switcherStyles.Label}>
                          IMAP SSL
                        </Switcher.Label>*/}
                          <Switcher.HiddenInput />
                        </Switcher.Root>
                      </Field.Root>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <Field.Root class={fieldStyles.Root}>
                      <Field.Label class={fieldStyles.Label}>SMTP Host</Field.Label>
                      <Field.Input
                        class={fieldStyles.Input}
                        value={formData.smtpHost}
                        onInput={(e) => setFormData('smtpHost', e.target.value)}
                        autoCapitalize="off"
                      />
                    </Field.Root>
                    <div class="grid grid-cols-2 gap-4">
                      <Field.Root class={fieldStyles.Root}>
                        <Field.Label class={fieldStyles.Label}>SMTP Port</Field.Label>
                        <Field.Input
                          type="number"
                          value={formData.smtpPort}
                          onInput={(e) => setFormData('smtpPort', Number(e.target.value))}
                          class={fieldStyles.Input}
                          autoCapitalize="off"
                        />
                      </Field.Root>
                      <Field.Root class={fieldStyles.Root}>
                        <Field.Label class={fieldStyles.Label}>SMTP SSL</Field.Label>
                        <Switcher.Root
                          class={switcherStyles.Root}
                          checked={formData.smtpUseSSL}
                          onCheckedChange={(e) => setFormData('smtpUseSSL', e.checked)}
                        >
                          <Switcher.Control class={switcherStyles.Control}>
                            <Switcher.Thumb class={switcherStyles.Thumb} />
                          </Switcher.Control>
                          {/*<Switcher.Label class={switcherStyles.Label}>
                          SMTP SSL
                        </Switcher.Label>*/}
                          <Switcher.HiddenInput />
                        </Switcher.Root>
                      </Field.Root>
                    </div>
                  </div>
                </Fieldset.Root>
              </div>
              <div class={dialogStyles.Actions}>
                <Dialog.CloseTrigger
                  class={buttonStyles.Root}
                  data-variant="solid"
                  disabled={mailStore.state.loading}
                  onClick={handleSubmit}
                >
                  Accept
                </Dialog.CloseTrigger>
              </div>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </div>
  )
}
