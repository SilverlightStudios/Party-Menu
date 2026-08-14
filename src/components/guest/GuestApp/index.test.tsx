import type { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Drink, Guest, Party } from '@/lib/supabase/types'
import GuestApp from './index'

vi.mock('@silk-hq/components', async () => await import('@/test/mocks/silk'))

vi.mock('@/hooks/useHaptics', () => ({
  useHaptics: () => ({ trigger: vi.fn() }),
}))

vi.mock('@/hooks/useTheme', () => ({
  useTheme: vi.fn(),
}))

vi.mock('@/hooks/useGuestOrders', () => ({
  useGuestOrders: () => ({
    pendingOrders: [],
    hasPendingOrders: false,
    lastFulfilledOrder: null,
    dismissFulfilled: vi.fn(),
    cancellingOrderId: null,
    cancelPendingOrder: vi.fn(),
  }),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      insert: () => ({
        select: () => ({
          single: async () => ({ data: null, error: null }),
        }),
      }),
    }),
  }),
}))

vi.mock('@/lib/utils', () => ({
  preloadImage: vi.fn(),
}))

vi.mock('@/components/ui/AppIcons', () => ({
  PartyIcon: ({ size }: { size?: number }) => <span data-size={size}>party</span>,
  SuccessIcon: ({ size }: { size?: number }) => <span data-size={size}>success</span>,
}))

vi.mock('@/components/guest/OnboardingStep2', () => ({
  default: ({ guest }: { guest: Guest }) => <div>{`Guest page for ${guest.name}`}</div>,
}))

vi.mock('@/components/guest/PendingOrderSheet', () => ({
  default: () => null,
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

vi.mock('@/components/ui/AvatarBadge', () => ({
  default: ({ name }: { name: string }) => <span aria-hidden="true">{name.slice(0, 1)}</span>,
}))

vi.mock('@/components/ui/Grainient', () => ({
  default: () => null,
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

const guests: Guest[] = [
  {
    id: 'guest-1',
    party_id: party.id,
    name: 'Avery Stone',
    photo_url: null,
    joined_at: '2026-03-10T00:00:00.000Z',
  },
  {
    id: 'guest-2',
    party_id: party.id,
    name: 'Mia Gray',
    photo_url: null,
    joined_at: '2026-03-10T00:00:00.000Z',
  },
]

const drinks: Drink[] = []

describe('GuestApp', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('shows a loading skeleton before the guest page and removes the welcome frame', async () => {
    const user = userEvent.setup()

    render(<GuestApp party={party} guests={guests} drinks={drinks} />)

    expect(screen.getByText('Tap below to get started')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /find yourself/i }))
    await user.click(await screen.findByRole('button', { name: /avery stone/i }))

    expect(await screen.findByText("Loading Avery Stone's page...")).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Guest page for Avery Stone')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.queryByText('Tap below to get started')).not.toBeInTheDocument()
    })

    expect(localStorage.getItem('party_menu_guest_id')).toBe('guest-1')
    expect(localStorage.getItem('party_menu_party_id')).toBe('party-1')
  })
})
