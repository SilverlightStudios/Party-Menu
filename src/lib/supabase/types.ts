export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type OrderStatus = 'pending' | 'fulfilled'

export interface Party {
  id: string
  name: string
  welcome_message: string
  host_id: string
  is_active: boolean
  created_at: string
}

export interface Guest {
  id: string
  party_id: string
  name: string
  photo_url: string | null
  joined_at: string
}

export interface Drink {
  id: string
  party_id: string
  name: string
  description: string | null
  photo_url: string | null
  is_available: boolean
  display_order: number
}

export interface Order {
  id: string
  party_id: string
  guest_id: string
  drink_id: string | null
  custom_request: string | null
  status: OrderStatus
  created_at: string
  // Joined fields
  guest?: Guest
  drink?: Drink
}

export interface Poke {
  id: string
  party_id: string
  from_guest_id: string
  to_guest_id: string
  created_at: string
  // Joined fields
  from_guest?: Guest
}

export interface PushSubscriptionRow {
  id: string
  host_id: string
  party_id: string
  endpoint: string
  p256dh: string
  auth: string
  created_at: string
}

// Supabase Database type — must match the exact shape the SDK expects
export type Database = {
  public: {
    Tables: {
      parties: {
        Row: Party
        Insert: {
          id?: string
          name: string
          welcome_message?: string
          host_id: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          welcome_message?: string
          host_id?: string
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      guests: {
        Row: Guest
        Insert: {
          id?: string
          party_id: string
          name: string
          photo_url?: string | null
          joined_at?: string
        }
        Update: {
          id?: string
          party_id?: string
          name?: string
          photo_url?: string | null
          joined_at?: string
        }
        Relationships: []
      }
      drinks: {
        Row: Drink
        Insert: {
          id?: string
          party_id: string
          name: string
          description?: string | null
          photo_url?: string | null
          is_available?: boolean
          display_order?: number
        }
        Update: {
          id?: string
          party_id?: string
          name?: string
          description?: string | null
          photo_url?: string | null
          is_available?: boolean
          display_order?: number
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          party_id: string
          guest_id: string
          drink_id: string | null
          custom_request: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          party_id: string
          guest_id: string
          drink_id?: string | null
          custom_request?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          party_id?: string
          guest_id?: string
          drink_id?: string | null
          custom_request?: string | null
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      pokes: {
        Row: {
          id: string
          party_id: string
          from_guest_id: string
          to_guest_id: string
          created_at: string
        }
        Insert: {
          id?: string
          party_id: string
          from_guest_id: string
          to_guest_id: string
          created_at?: string
        }
        Update: {
          id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: PushSubscriptionRow
        Insert: {
          id?: string
          host_id: string
          party_id: string
          endpoint: string
          p256dh: string
          auth: string
          created_at?: string
        }
        Update: {
          id?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
