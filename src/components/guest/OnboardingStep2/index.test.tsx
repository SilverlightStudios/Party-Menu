import type { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Drink, Guest, Party } from '@/lib/supabase/types'
import MainView from './index'

vi.mock('@silk-hq/components', async () => await import('@/test/mocks/silk'))

vi.mock('@/hooks/useHaptics', () => ({
  useHaptics: () => ({ trigger: vi.fn() }),
}))

vi.mock('@/hooks/usePokes', () => ({
  usePokes: () => ({
    incomingPoke: null,
    dismissPoke: vi.fn(),
  }),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
    }),
  }),
}))

vi.mock('@/lib/utils', () => ({
  preloadImage: vi.fn(),
}))

vi.mock('@/components/ui/AppIcons', () => ({
  DrinkIcon: ({ size }: { size?: number }) => <span data-size={size}>drink</span>,
  PendingIcon: ({ size }: { size?: number }) => <span data-size={size}>pending</span>,
  PhotoIcon: ({ size }: { size?: number }) => <span data-size={size}>photo</span>,
  PokeIcon: ({ size }: { size?: number }) => <span data-size={size}>poke</span>,
  SparklesIcon: ({ size }: { size?: number }) => <span data-size={size}>sparkles</span>,
  SuccessIcon: ({ size }: { size?: number }) => <span data-size={size}>success</span>,
}))

vi.mock('@/components/ui/AvatarBadge', () => ({
  default: ({ name }: { name: string }) => <span aria-hidden="true">{name.slice(0, 1)}</span>,
}))

vi.mock('@/components/ui/Toast', () => ({
  Toast: {
    Root: ({
      children,
      presented,
    }: {
      children: ReactNode
      presented?: boolean
    }) => (presented ? <>{children}</> : null),
    Portal: ({ children }: { children: ReactNode }) => <>{children}</>,
    View: ({ children }: { children: ReactNode }) => <>{children}</>,
    Content: ({ children }: { children: ReactNode }) => <>{children}</>,
  },
}))

vi.mock('@/components/ui/BottomSheet', () => ({
  BottomSheet: {
    Root: ({
      children,
      presented = false,
    }: {
      children: ReactNode
      presented?: boolean
    }) => (presented ? <>{children}</> : null),
    Portal: ({ children }: { children: ReactNode }) => <>{children}</>,
    View: ({ children }: { children: ReactNode }) => <>{children}</>,
    Backdrop: () => null,
    Content: ({ children }: { children: ReactNode }) => <>{children}</>,
    Handle: () => null,
    Title: ({ children }: { children: ReactNode }) => <>{children}</>,
    Description: ({ children }: { children: ReactNode }) => <>{children}</>,
    Trigger: ({ children }: { children: ReactNode }) => <>{children}</>,
  },
}))

const startViewTransition = vi.fn((update: () => void) => {
  update()

  return {
    ready: Promise.resolve(),
    finished: Promise.resolve(),
    updateCallbackDone: Promise.resolve(),
    types: [],
    skipTransition: vi.fn(),
  } as unknown as ViewTransition
})

const party: Party = {
  id: 'party-1',
  name: 'Spring Party',
  welcome_message: 'Welcome to the Spring Party',
  host_id: 'host-1',
  is_active: true,
  created_at: '2026-03-10T00:00:00.000Z',
  theme_color1: '#ff8a8a',
  theme_color2: '#8ad4ff',
  theme_color3: '#ffe88a',
}

const guest: Guest = {
  id: 'guest-1',
  party_id: party.id,
  name: 'Avery Stone',
  photo_url: null,
  joined_at: '2026-03-10T00:00:00.000Z',
}

const drinks: Drink[] = [
  {
    id: 'drink-1',
    party_id: party.id,
    name: 'Maia',
    description: 'Shochu, pineapple, yuzu, and basil.',
    photo_url: 'https://example.com/maia.jpg',
    is_available: true,
    display_order: 0,
    pdp_description: 'A bright, floral cocktail.',
    ingredients: ['Shochu', 'Pineapple', 'Yuzu', 'Basil'],
    fun_fact: 'Yuzu is intensely aromatic.',
    source_url: null,
  },
]

function getElementsByViewTransitionName(container: HTMLElement, name: string) {
  return Array.from(container.querySelectorAll<HTMLElement>('*')).filter(
    (element) => element.style.viewTransitionName === name
  )
}

describe('MainView drink transitions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(document, 'startViewTransition', {
      configurable: true,
      value: startViewTransition,
    })
  })

  it('keeps one shared-element target while the detail sheet is open and restores it on close', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <MainView
        party={party}
        guest={guest}
        allGuests={[guest]}
        drinks={drinks}
      />
    )

    await user.click(screen.getByRole('button', { name: /order a drink/i }))
    await user.click(screen.getByText('Maia'))

    await screen.findByRole('button', { name: /order this drink/i })

    expect(startViewTransition).toHaveBeenCalledTimes(1)
    expect(getElementsByViewTransitionName(container, 'drink-img-drink-1')).toHaveLength(1)
    expect(getElementsByViewTransitionName(container, 'drink-name-drink-1')).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: /order this drink/i }))

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /order this drink/i })).not.toBeInTheDocument()
    })

    expect(startViewTransition).toHaveBeenCalledTimes(2)
    expect(getElementsByViewTransitionName(container, 'drink-img-drink-1')).toHaveLength(1)
    expect(getElementsByViewTransitionName(container, 'drink-name-drink-1')).toHaveLength(1)
  })
})
