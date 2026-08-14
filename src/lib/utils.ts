export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

const AVATAR_GRADIENTS = [
  ['#ff9ffc', '#ff6f91', '#7a5cff'],
  ['#7a5cff', '#4ac7ff', '#8bf6ff'],
  ['#ffb36b', '#ff6f91', '#8e6cff'],
  ['#7de7c7', '#4ac7ff', '#5b6bff'],
  ['#ffd86f', '#ff8b6a', '#ff5cb8'],
  ['#7df0ff', '#6b8dff', '#b68cff'],
] as const

function hashString(value: string) {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index)
    hash |= 0
  }

  return Math.abs(hash)
}

export function getAvatarGradient(seed: string) {
  const [start, middle, end] = AVATAR_GRADIENTS[hashString(seed) % AVATAR_GRADIENTS.length]

  return [
    'radial-gradient(circle at 20% 18%, rgba(255, 255, 255, 0.34) 0%, rgba(255, 255, 255, 0) 36%)',
    'radial-gradient(circle at 82% 14%, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0) 28%)',
    `linear-gradient(145deg, ${start} 0%, ${middle} 52%, ${end} 100%)`,
  ].join(', ')
}

export function preloadImage(src: string | null | undefined) {
  if (!src || typeof Image === 'undefined') return

  const image = new Image()
  image.src = src
}
