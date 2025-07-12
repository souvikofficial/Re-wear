import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client for client-side operations
// Ensure these environment variables are set in your Vercel project settings
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/* =========================================================================
   Types
   ====================================================================== */
export interface UserProfile {
  id: string
  name: string | null
  email: string
  avatar_url: string | null
  points: number
  created_at: string
  updated_at: string
}

/* =========================================================================
   Service
   ====================================================================== */
export const authService = {
  /** Get the current authenticated user from Supabase Auth */
  async getCurrentUser() {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("Auth session error:", error)
      return null
    }

    if (!data?.session) {
      // console.log("Auth session missing!") // Silenced as per previous fix
      return null
    }

    return data.session.user
  },

  /** Get a user's profile from the 'users' table */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).maybeSingle()

    if (error) {
      console.error("Get profile error:", error)
      throw new Error("Failed to fetch user profile.")
    }

    return data || null
  },

  /** Sign up a new user */
  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    if (error) {
      console.error("Signup error:", error)
      throw new Error(error.message || "Signup failed.")
    }

    // Attempt to create user profile if not automatically created by trigger
    if (data.user && data.user.id) {
      const existingProfile = await this.getUserProfile(data.user.id)
      if (!existingProfile) {
        const { error: profileError } = await supabase.from("users").insert({
          id: data.user.id,
          email: data.user.email,
          name: name,
          points: 0,
        })
        if (profileError) {
          console.error("Error creating user profile after signup:", profileError)
          throw new Error("Signup successful, but failed to create user profile.")
        }
      }
    }

    return data
  },

  /** Sign in an existing user */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Signin error:", error)
      throw new Error(error.message || "Invalid login credentials.")
    }

    return data
  },

  /** Sign out the current user */
  async signOut() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Signout error:", error)
      throw new Error("Failed to sign out.")
    }
  },
}
