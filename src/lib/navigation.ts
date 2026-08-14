import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

type DocumentWithViewTransition = Document & {
  startViewTransition: (update: () => void) => void
}

/**
 * Navigate with View Transition API for smooth cross-page animations.
 * Falls back to normal router.push() in unsupported browsers.
 */
export function navigateWithTransition(
  router: AppRouterInstance,
  path: string,
  direction: 'forward' | 'back' = 'forward'
) {
  if (typeof document !== 'undefined' && 'startViewTransition' in document) {
    const transitioningDocument = document as DocumentWithViewTransition
    document.documentElement.dataset.transitionDirection = direction
    transitioningDocument.startViewTransition(() => {
      router.push(path)
    })
  } else {
    router.push(path)
  }
}
