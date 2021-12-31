const mountSDK = (src) => {
  return new Promise((resolve) => {
    const node = document.createElement('script')
    document.head.appendChild(node)

    node.src = src
    node.onload = function () {
      resolve(src)
    }
  })
}

export { mountSDK }