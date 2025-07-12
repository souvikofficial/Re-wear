"use client"

import { useEffect, useState } from "react"
import { notificationsService, type Notification } from "@/lib/notifications"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Check } from "lucide-react"

interface NotificationBellProps {
  userId: string
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadNotifications()

    // Subscribe to new notifications
    const subscription = notificationsService.subscribeToNotifications(userId, (payload) => {
      setNotifications((prev) => [payload.new, ...prev])
      setUnreadCount((prev) => prev + 1)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [userId])

  const loadNotifications = async () => {
    try {
      const data = await notificationsService.getUserNotifications(userId)
      setNotifications(data)
      setUnreadCount(data.filter((n) => !n.is_read).length)
    } catch (error) {
      console.error("Error loading notifications:", error)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllAsRead(userId)
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Error marking notifications as read:", error)
    }
  }

  const getNotificationMessage = (notification: Notification) => {
    switch (notification.type) {
      case "swap_requested":
        return "Someone wants to swap with your item"
      case "swap_accepted":
        return "Your swap request was accepted!"
      case "swap_rejected":
        return "Your swap request was declined"
      case "swap_completed":
        return "Swap completed successfully"
      default:
        return "New notification"
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notifications
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="h-auto p-1">
              <Check className="h-4 w-4" />
            </Button>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <DropdownMenuItem disabled>No notifications yet</DropdownMenuItem>
        ) : (
          notifications.slice(0, 10).map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`flex flex-col items-start p-3 ${!notification.is_read ? "bg-blue-50" : ""}`}
            >
              <div className="font-medium text-sm">{getNotificationMessage(notification)}</div>
              <div className="text-xs text-gray-500 mt-1">{new Date(notification.created_at).toLocaleDateString()}</div>
            </DropdownMenuItem>
          ))
        )}

        {notifications.length > 10 && (
          <DropdownMenuItem className="text-center text-sm text-gray-500">View all notifications</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
