import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client for client-side operations
// Ensure these environment variables are set in your Vercel project settings
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface User {
  id: string
  name: string
  email: string
  points: number
  avatar_url?: string
  is_admin: boolean
  created_at: string
}

export interface Item {
  id: string
  owner_id: string
  title: string
  description?: string
  category: string
  type: string
  size: string
  condition: string
  tags: string[]
  images: string[]
  point_value: number
  status: "pending" | "active" | "swapped" | "redeemed"
  created_at: string
  owner?: User
}

export interface Swap {
  id: string
  item_id: string
  requester_id: string
  status: "requested" | "accepted" | "rejected" | "completed"
  requested_at: string
  item?: Item
  requester?: User
}

export interface Notification {
  id: string
  user_id: string
  type: string
  related_id?: string
  is_read: boolean
  created_at: string
}

export interface Announcement {
  id: string
  title: string
  message: string
  created_at: string
}
