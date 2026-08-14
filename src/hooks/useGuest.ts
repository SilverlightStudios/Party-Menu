'use client'

import { useSyncExternalStore } from 'react'

const GUEST_STORAGE_KEY = 'party_menu_guest_id'
const PARTY_STORAGE_KEY = 'party_menu_party_id'
const GUEST_STORAGE_EVENT = 'party-menu-guest-change'

interface GuestState {
  guestId: string | null
  partyId: string | null
  isLoaded: boolean
}

const SERVER_SNAPSHOT: GuestState = {
  guestId: null,
  partyId: null,
  isLoaded: false,
}

let cachedClientSnapshot: GuestState = {
  guestId: null,
  partyId: null,
  isLoaded: true,
}

function getSnapshot(): GuestState {
  if (typeof window === 'undefined') {
    return SERVER_SNAPSHOT
  }

  const guestId = localStorage.getItem(GUEST_STORAGE_KEY)
  const partyId = localStorage.getItem(PARTY_STORAGE_KEY)

  if (
    cachedClientSnapshot.guestId !== guestId ||
    cachedClientSnapshot.partyId !== partyId
  ) {
    cachedClientSnapshot = {
      guestId,
      partyId,
      isLoaded: true,
    }
  }

  return cachedClientSnapshot
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => {}
  }

  window.addEventListener('storage', onStoreChange)
  window.addEventListener(GUEST_STORAGE_EVENT, onStoreChange)

  return () => {
    window.removeEventListener('storage', onStoreChange)
    window.removeEventListener(GUEST_STORAGE_EVENT, onStoreChange)
  }
}

function notifyGuestChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(GUEST_STORAGE_EVENT))
  }
}

export function useGuest() {
  const { guestId, partyId, isLoaded } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => SERVER_SNAPSHOT
  )

  function saveGuest(newGuestId: string, newPartyId: string) {
    if (typeof window === 'undefined') return

    localStorage.setItem(GUEST_STORAGE_KEY, newGuestId)
    localStorage.setItem(PARTY_STORAGE_KEY, newPartyId)
    notifyGuestChange()
  }

  function clearGuest() {
    if (typeof window === 'undefined') return

    localStorage.removeItem(GUEST_STORAGE_KEY)
    localStorage.removeItem(PARTY_STORAGE_KEY)
    notifyGuestChange()
  }

  return { guestId, partyId, saveGuest, clearGuest, isLoaded }
}
