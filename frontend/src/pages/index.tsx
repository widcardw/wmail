import { Button } from '~/components/ui/button'
import { toaster } from '~/components/ui/toaster'

function Home() {
  return (
    <>
      <h1>Home Page</h1>
      <Button
        onClick={() => {
          toaster.create({
            title: 'Hello',
            description: 'This is a toast! Write some long text here to make line breaks.',
            duration: Infinity,
            type: 'success'
          })
        }}
      >
        Toast
      </Button>
    </>
  )
}

export default Home
