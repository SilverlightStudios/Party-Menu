export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null

  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
    return reg
  } catch (err) {
    console.error('Service worker registration failed:', err)
    return null
  }
}
