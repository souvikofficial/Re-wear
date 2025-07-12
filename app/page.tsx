"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { itemsService, type Item } from "@/lib/items"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Star, ArrowRightLeft } from "lucide-react"
import { NotificationBell } from "@/components/notification-bell"
import { authService } from "@/lib/auth"

export default function HomePage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    loadInitialData()

    // Subscribe to real-time item updates
    const subscription = itemsService.subscribeToItems((payload) => {
      if (payload.eventType === "INSERT") {
        setItems((prev) => [payload.new, ...prev])
      } else if (payload.eventType === "UPDATE") {
        setItems((prev) => prev.map((item) => (item.id === payload.old.id ? payload.new : item)))
      } else if (payload.eventType === "DELETE") {
        setItems((prev) => prev.filter((item) => item.id !== payload.old.id))
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadInitialData = async () => {
    try {
      const [fetchedItems, user] = await Promise.all([itemsService.getActiveItems(), authService.getCurrentUser()])
      setItems(fetchedItems)
      setCurrentUser(user)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-green-600">
              ReWear
            </Link>

            <nav className="flex items-center space-x-4">
              {currentUser ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost">Dashboard</Button>
                  </Link>
                  <NotificationBell userId={currentUser.id} />
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost">Login</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button>Sign Up</Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-green-600 text-white py-20 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Exchange Clothes, Sustain Fashion</h1>
          <p className="text-lg md:text-xl mb-8">
            Join ReWear, the community platform for swapping pre-loved clothing and accessories.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
              Get Started - It's Free!
            </Button>
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <Package className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. List Your Items</h3>
              <p className="text-gray-600">Upload photos and details of clothes you want to swap.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <ArrowRightLeft className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Request Swaps</h3>
              <p className="text-gray-600">Browse items from others and request a swap using points.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <Star className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Earn Points</h3>
              <p className="text-gray-600">Successfully complete swaps to earn points for new items.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Items Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Latest Items</h2>
          {items.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items listed yet</h3>
              <p className="text-gray-500 mb-4">Be the first to add an item to the community!</p>
              <Link href="/items/new">
                <Button>Add Your First Item</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <Card key={item.id}>
                  <div className="aspect-square bg-gray-100 relative">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0] || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-full object-cover rounded-t-lg"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=300&width=300"
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <img
                          src="/placeholder.svg?height=300&width=300"
                          alt="No image available"
                          className="w-full h-full object-cover opacity-50 rounded-t-lg"
                        />
                      </div>
                    )}
                    <Badge
                      className={`absolute top-2 right-2 ${
                        item.status === "active"
                          ? "bg-green-600"
                          : item.status === "pending"
                            ? "bg-yellow-600"
                            : "bg-gray-600"
                      }`}
                    >
                      {item.status}
                    </Badge>
                  </div>

                  <CardHeader>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription>
                      {item.category} • Size {item.size} • {item.point_value} points
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <Link href={`/items/${item.id}`}>
                      <Button className="w-full" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-green-600 text-white py-16 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to ReWear?</h2>
          <p className="text-lg mb-8">Start exchanging your clothes and discover new styles today!</p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
              Join the Community
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} ReWear. All rights reserved.</p>
          <div className="flex justify-center space-x-4 mt-4">
            <Link href="#" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
