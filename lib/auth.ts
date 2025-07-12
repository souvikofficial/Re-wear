import { supabase } from "./supabase"

export interface AuthError {
  message: string
  type: "validation" | "network" | "auth" | "server"
  details?: string
}

export const authService = {
  async signUp(email: string, password: string, name: string) {
    try {
      // First, check if user already exists
      const { data: existingUser } = await supabase.from("users").select("email").eq("email", email).single()

      if (existingUser) {
        throw new Error("An account with this email already exists. Please sign in instead.")
      }

      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      })

      if (error) {
        console.error("Signup error:", error)

        // Handle specific Supabase errors
        switch (error.message) {
          case "User already registered":
            throw new Error("An account with this email already exists. Please sign in instead.")
          case "Password should be at least 6 characters":
            throw new Error("Password must be at least 6 characters long.")
          case "Invalid email":
            throw new Error("Please enter a valid email address.")
          case "Signup is disabled":
            throw new Error("Account registration is currently disabled. Please contact support.")
          default:
            throw new Error(error.message || "Failed to create account. Please try again.")
        }
      }

      if (!data.user) {
        throw new Error("Failed to create user account. Please try again.")
      }

      // If user is created but session doesn't exist (email confirmation required)
      if (data.user && !data.session) {
        console.log("User created, email confirmation required")
        return {
          user: data.user,
          session: null,
          needsConfirmation: true,
        }
      }

      // If user is created and session exists (auto-confirmed)
      if (data.user && data.session) {
        console.log("User created and auto-signed in")

        // Wait a moment for the database trigger to create the profile
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Verify the profile was created
        try {
          await this.getUserProfile(data.user.id)
        } catch (profileError) {
          console.warn("Profile not found, creating manually:", profileError)
          // Create profile manually if trigger failed
          await supabase.from("users").insert({
            id: data.user.id,
            email: data.user.email!,
            name: name,
          })
        }

        return {
          user: data.user,
          session: data.session,
          needsConfirmation: false,
        }
      }

      return data
    } catch (error: any) {
      console.error("Auth service signup error:", error)
      throw error
    }
  },

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Signin error:", error)

        // Handle specific Supabase errors
        switch (error.message) {
          case "Invalid login credentials":
            throw new Error("Invalid email or password. Please check your credentials and try again.")
          case "Email not confirmed":
            throw new Error("Please check your email and click the confirmation link before signing in.")
          case "Too many requests":
            throw new Error("Too many login attempts. Please wait a few minutes before trying again.")
          case "User not found":
            throw new Error("No account found with this email address. Please sign up first.")
          default:
            throw new Error(error.message || "Failed to sign in. Please try again.")
        }
      }

      if (!data.session) {
        throw new Error("Failed to create session. Please try again.")
      }

      return data
    } catch (error: any) {
      console.error("Auth service signin error:", error)
      throw error
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Signout error:", error)
        throw new Error("Failed to sign out. Please try again.")
      }
    } catch (error: any) {
      console.error("Auth service signout error:", error)
      throw error
    }
  },

  /**
   * Returns the current authenticated user or `null` if no session exists.
   * Supabase will throw the “Auth session missing!” error when there’s no persisted
   * session (e.g. first-time visitors). We treat that case as an unauthenticated user
   * and suppress the console noise.
   */
  async getCurrentUser() {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      // If there’s no session, the visitor is simply not logged in.
      if (!session || sessionError) return null

      return session.user
    } catch (err) {
      // Any network/server error gets logged for debugging, but we still return null
      console.error("Auth service getCurrentUser error:", err)
      return null
    }
  },

  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

      if (error) {
        console.error("Get profile error:", error)
        throw new Error("Failed to load user profile.")
      }

      return data
    } catch (error: any) {
      console.error("Auth service get profile error:", error)
      throw error
    }
  },

  async updateUserProfile(userId: string, updates: { name?: string; avatar_url?: string }) {
    try {
      const { data, error } = await supabase.from("users").update(updates).eq("id", userId).select().single()

      if (error) {
        console.error("Update profile error:", error)
        throw new Error("Failed to update profile.")
      }

      return data
    } catch (error: any) {
      console.error("Auth service update profile error:", error)
      throw error
    }
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  },

  // Utility function to validate email format
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  // Utility function to validate password strength
  validatePassword(password: string): { isValid: boolean; message?: string } {
    if (password.length < 6) {
      return { isValid: false, message: "Password must be at least 6 characters long." }
    }
    if (password.length > 128) {
      return { isValid: false, message: "Password must be less than 128 characters long." }
    }
    if (!/[a-zA-Z]/.test(password)) {
      return { isValid: false, message: "Password must contain at least one letter." }
    }
    return { isValid: true }
  },
}
