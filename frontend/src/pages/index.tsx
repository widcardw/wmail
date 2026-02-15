import { onMount } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import { mailStore } from '~/stores/mail'

export default function HomePage() {
  const navigate = useNavigate()

  onMount(async () => {
    await mailStore.loadAccounts()
    
    if (mailStore.state.accounts.length > 0) {
      // Set first account as current
      mailStore.setCurrentAccount(mailStore.state.accounts[0])
      navigate('/mailbox')
    } else {
      navigate('/accounts')
    }
  })

  return (
    <div class="flex items-center justify-center h-screen">
      <div class="text-center">
        <div class="i-ri-loader-4-line w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <p class="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
