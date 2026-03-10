'use client'

import { useState, useEffect } from 'react'

const GUEST_STORAGE_KEY = 'party_menu_guest_id'
const PARTY_STORAGE_KEY = 'party_menu_party_id'

export function useGuest() {
  const [guestId, setGuestId] = useState<string | null>(null)
  const [partyId, setPartyId] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const storedGuestId = localStorage.getItem(GUEST_STORAGE_KEY)
    const storedPartyId = localStorage.getItem(PARTY_STORAGE_KEY)
    setGuestId(storedGuestId)
    setPartyId(storedPartyId)
    setIsLoaded(true)
  }, [])

  function saveGuest(newGuestId: string, newPartyId: string) {
    localStorage.setItem(GUEST_STORAGE_KEY, newGuestId)
    localStorage.setItem(PARTY_STORAGE_KEY, newPartyId)
    setGuestId(newGuestId)
    setPartyId(newPartyId)
  }

  function clearGuest() {
    localStorage.removeItem(GUEST_STORAGE_KEY)
    localStorage.removeItem(PARTY_STORAGE_KEY)
    setGuestId(null)
    setPartyId(null)
  }

  return { guestId, partyId, saveGuest, clearGuest, isLoaded }
}
