import { supabase } from "./supabase"

/* =========================================================================
   Types
   ====================================================================== */
export interface Notification {
  id: string
  user_id: string
  type: "swap_requested" | "swap_accepted" | "swap_rejected" | "swap_completed"
  message: string | null
  is_read: boolean
  created_at: string
  related_id: string | null // e.g., swap_id
}

/* =========================================================================
   Service
   ====================================================================== */
export const notificationsService = {
  /** Get all notifications for a user */
  async getUserNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("notificationsService.getUserNotifications error:", error)
      throw new Error("Failed to load notifications.")
    }

    return data || []
  },

  /** Mark a specific notification as read */
  async markAsRead(notificationId: string) {
    const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId)

    if (error) {
      console.error("notificationsService.markAsRead error:", error)
      throw new Error("Failed to mark notification as read.")
    }
  },

  /** Mark all notifications for a user as read */
  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false)

    if (error) {
      console.error("notificationsService.markAllAsRead error:", error)
      throw new Error("Failed to mark all notifications as read.")
    }
  },

  /** Subscribe to new notifications for a specific user */
  subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`notifications_for_user_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        callback,
      )
      .subscribe()
  },
}
