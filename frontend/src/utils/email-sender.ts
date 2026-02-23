function capitalize(word: string) {
  return word[0].toUpperCase() + word.slice(1)
}

function getEmailSender(email: string) {
  const domain = email.split('@')[1]
  const slices = domain.split('.')
  return capitalize(slices[slices.length - 2])
}

export { getEmailSender, capitalize }
