import { Dialog } from '@ark-ui/solid/dialog'
import { createSignal, For, Match, Switch, onMount, Show } from 'solid-js'
import { Portal } from 'solid-js/web'
import { Button } from '~/components/ui/button'
import { Field, Fieldset, Switch as Switcher, Tabs } from '@ark-ui/solid'
import { mailStore } from '~/stores/mail'

import buttonStyles from '~/components/ui/button/index.module.css'
import dialogStyles from '~/components/ui/dialog/index.module.css'
import fieldStyles from '~/components/ui/fields/field.module.css'
import fieldSetStyles from '~/components/ui/fields/fieldset.module.css'
import tabStyles from '~/components/ui/tabs/index.module.css'
import switcherStyles from '~/components/ui/switcher/index.module.css'

import clsx from 'clsx'
import { createStore } from 'solid-js/store'
import { Account } from '#/wmail/services'
import { toaster } from '~/components/ui/toaster'

import { Dialogs as WailsDialogs } from '@wailsio/runtime'

export default function AccountPage() {
  const [dlgOpen, setDlgOpen] = createSignal(false)
  const [editingAccount, setEditingAccount] = createSignal<Account | null>(null)

  onMount(() => {
    mailStore.loadAccounts()
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
    emailProtocolUse: 'IMAP',
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
      emailProtocolUse: 'IMAP',
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
      emailProtocolUse: account.emailProtocolUse,
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
        await mailStore.addAccount({...formData})
      }
      toaster.success({ title: `Successfully added account ${formData.email}` })
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

  const handleDelete = async (accountId: string) => {
    const answer = await WailsDialogs.Question({
      Title: 'Are you sure?',
      Message: 'You are going to delete this account!',
      Buttons: [
        { Label: 'Cancel', IsCancel: true, IsDefault: true },
        { Label: 'Delete Account', IsCancel: false, IsDefault: false },
      ],
    })
    console.log(answer)
    if (answer === 'Delete Account') {
      await mailStore.deleteAccount(accountId)  // 这里可能有点问题
    }
  }

  return (
    <div class="p-4 min-w-600px">
      <div class="flex justify-between">
        <h3>Accounts</h3>
        <Button onClick={openAddForm}>Add</Button>
      </div>

      <Show when={!mailStore.state.loading} fallback="Loading...">
        <div class="grid gap-4 mt-2">
          <For each={mailStore.state.accounts}>
            {(account) => (
              <div class="border border-border rounded-lg p-4 hover:bg-primary-hvbg transition-colors">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-white mb-1">{account.name}</h3>
                    <p class="text-muted-foreground">{account.email}</p>
                    <div class="mt-2 text-sm text-muted-foreground">
                      <Switch>
                        <Match when={account.emailProtocolUse === 'IMAP'}>
                          <div>
                            IMAP:{' '}
                            <code>
                              {account.imapHost}:{account.imapPort}
                            </code>
                          </div>
                        </Match>
                        <Match when={account.emailProtocolUse === 'SMTP'}>
                          <div>
                            IMAP:{' '}
                            <code>
                              {account.smtpHost}:{account.smtpPort}
                            </code>
                          </div>
                        </Match>
                      </Switch>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(account)}>
                      <div class="i-ri-edit-line w-5 h-5" />
                    </Button>
                    <Button
                      variant="destructive_icon"
                      size="icon"
                      onClick={() => handleDelete(account.id)}
                    >
                      <div class="i-ri-delete-bin-line w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>
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
              <Dialog.Description class={dialogStyles.Description}>
                Supports IMAP or SMTP.
              </Dialog.Description>
              <div class={clsx(dialogStyles.ScrollContainer, 'w-full')}>
                <Fieldset.Root class={clsx(fieldSetStyles.Root, 'w-full')}>
                  <Field.Root class={fieldStyles.Root} required>
                    <Field.Label class={fieldStyles.Label}>Email</Field.Label>
                    <Field.Input
                      class={fieldStyles.Input}
                      placeholder="Enter the email address"
                      value={formData.email}
                      onInput={(e) => setFormData('email', e.target.value)}
                    />
                  </Field.Root>

                  <Field.Root class={fieldStyles.Root} required>
                    <Field.Label class={fieldStyles.Label}>Password</Field.Label>
                    <Field.Input
                      class={fieldStyles.Input}
                      placeholder="Enter the password"
                      type="password"
                      value={formData.password}
                      onInput={(e) => setFormData('password', e.target.value)}
                    />
                  </Field.Root>

                  <Field.Root class={fieldStyles.Root}>
                    <Field.Label class={fieldStyles.Label}>Display Name</Field.Label>
                    <Field.Input
                      class={fieldStyles.Input}
                      placeholder="Enter the display name of this account"
                      value={formData.name}
                      onInput={(e) => setFormData('name', e.target.value)}
                    />
                  </Field.Root>

                  <Tabs.Root
                    class={tabStyles.Root}
                    defaultValue="IMAP"
                    value={formData.emailProtocolUse}
                    onValueChange={(e) => setFormData('emailProtocolUse', e.value)}
                  >
                    <Tabs.List class={tabStyles.List}>
                      <Tabs.Trigger class={tabStyles.Trigger} value="IMAP">
                        IMAP
                      </Tabs.Trigger>
                      <Tabs.Trigger class={tabStyles.Trigger} value="SMTP">
                        SMTP
                      </Tabs.Trigger>
                    </Tabs.List>
                    <Tabs.Content class={tabStyles.Content} value="IMAP">
                      <Fieldset.Root class={clsx(fieldSetStyles.Root, 'w-full')}>
                        <Field.Root class={fieldStyles.Root}>
                          <Field.Label class={fieldStyles.Label}>IMAP Host</Field.Label>
                          <Field.Input
                            class={fieldStyles.Input}
                            value={formData.imapHost}
                            onInput={(e) => setFormData('imapHost', e.target.value)}
                          />
                        </Field.Root>
                        <Field.Root class={fieldStyles.Root}>
                          <Field.Label class={fieldStyles.Label}>IMAP Port</Field.Label>
                          <Field.Input
                            type="number"
                            value={formData.imapPort}
                            onInput={(e) => setFormData('imapPort', Number(e.target.value))}
                            class={fieldStyles.Input}
                          />
                        </Field.Root>
                        <Field.Root class={fieldStyles.Root}>
                          <Switcher.Root
                            class={switcherStyles.Root}
                            checked={formData.imapUseSSL}
                            onCheckedChange={(e) => setFormData('imapUseSSL', e.checked)}
                          >
                            <Switcher.Control class={switcherStyles.Control}>
                              <Switcher.Thumb class={switcherStyles.Thumb} />
                            </Switcher.Control>
                            <Switcher.Label class={switcherStyles.Label}>SSL</Switcher.Label>
                            <Switcher.HiddenInput />
                          </Switcher.Root>
                        </Field.Root>
                      </Fieldset.Root>
                    </Tabs.Content>
                    <Tabs.Content class={tabStyles.Content} value="SMTP">
                      <Fieldset.Root class={clsx(fieldSetStyles.Root, 'w-full')}>
                        <Field.Root class={fieldStyles.Root}>
                          <Field.Label class={fieldStyles.Label}>SMTP Host</Field.Label>
                          <Field.Input
                            class={fieldStyles.Input}
                            value={formData.smtpHost}
                            onInput={(e) => setFormData('smtpHost', e.target.value)}
                          />
                        </Field.Root>
                        <Field.Root class={fieldStyles.Root}>
                          <Field.Label class={fieldStyles.Label}>SMTP Port</Field.Label>
                          <Field.Input
                            type="number"
                            value={formData.smtpPort}
                            onInput={(e) => setFormData('smtpPort', Number(e.target.value))}
                            class={fieldStyles.Input}
                          />
                        </Field.Root>
                        <Field.Root class={fieldStyles.Root}>
                          <Switcher.Root
                            class={switcherStyles.Root}
                            checked={formData.smtpUseSSL}
                            onCheckedChange={(e) => setFormData('smtpUseSSL', e.checked)}
                          >
                            <Switcher.Control class={switcherStyles.Control}>
                              <Switcher.Thumb class={switcherStyles.Thumb} />
                            </Switcher.Control>
                            <Switcher.Label class={switcherStyles.Label}>SSL</Switcher.Label>
                            <Switcher.HiddenInput />
                          </Switcher.Root>
                        </Field.Root>
                      </Fieldset.Root>
                    </Tabs.Content>
                  </Tabs.Root>
                </Fieldset.Root>
              </div>
              <div class={dialogStyles.Actions}>
                <Dialog.CloseTrigger
                  class={buttonStyles.Root}
                  data-variant="solid"
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
