let getVideoByInput = null

function getInput() {
  if (getVideoByInput) return getVideoByInput
  const input = document.createElement('input')
  getVideoByInput = input
  input.setAttribute('type', 'file')
  input.setAttribute('accept', 'video/*')
  input.setAttribute('capture', 'user')
  input.style.display = 'none'
  document.body.append(input)
  return input
}

export default function getVideo() {
  const input = getInput()
  return new Promise((resolve) => {
    input.onchange = (e) => {
      resolve(e.target.files[0])
    }
    input.click()
  })
}
