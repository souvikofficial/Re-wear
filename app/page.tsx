"use client"

import { useEffect, useState } from "react"
import { itemsService, type Item } from "@/lib/items"
import { authService } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ItemCardSkeleton } from "@/components/loading-skeleton"
import { ErrorBoundary } from "@/components/error-boundary"
import { Sparkles, Star, Users, Recycle, ArrowRight, TrendingUp, Shield, Heart } from "lucide-react"
import Link from "next/link"

function HomePage() {
  const [items, setItems] = useState<Item[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadInitialData()

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    // Subscribe to item changes
    const itemsSubscription = itemsService.subscribeToItems((payload) => {
      if (payload.eventType === "INSERT" && payload.new.status === "active") {
        setItems((prev) => [payload.new, ...prev.slice(0, 7)])
      }
    })

    return () => {
      subscription.unsubscribe()
      itemsSubscription.unsubscribe()
    }
  }, [])

  const loadInitialData = async () => {
    try {
      setError(null)
      const [itemsData, userData] = await Promise.all([itemsService.getActiveItems(8), authService.getCurrentUser()])

      setItems(itemsData)
      setUser(userData)
    } catch (error) {
      console.error("Error loading data:", error)
      setError("Failed to load data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-primary flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-medium font-inter">Loading ReWear...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadInitialData}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-inter">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="gradient-primary p-2 rounded-xl">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                ReWear
              </h1>
            </div>

            <nav className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost" className="font-medium">
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/items/new">
                    <Button className="gradient-primary text-white shadow-lg hover:shadow-xl transition-all duration-300">
                      Add Item
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost" className="font-medium">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button className="gradient-primary text-white shadow-lg hover:shadow-xl transition-all duration-300">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10"></div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="animate-fade-in-up">
            <h2 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Give Your Clothes a{" "}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Second Life
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Join our community of conscious fashion lovers. Exchange clothes, earn points, and help reduce textile
              waste while refreshing your wardrobe sustainably.
            </p>

            <div className="flex flex-wrap justify-center gap-12 mb-16">
              <div className="flex items-center space-x-3 animate-slide-in-right">
                <div className="gradient-accent p-3 rounded-full">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold text-gray-900">Community Driven</div>
                  <div className="text-gray-600">Connect with like-minded people</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 animate-slide-in-right" style={{ animationDelay: "0.1s" }}>
                <div className="gradient-primary p-3 rounded-full">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold text-gray-900">Points System</div>
                  <div className="text-gray-600">Earn rewards for exchanges</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 animate-slide-in-right" style={{ animationDelay: "0.2s" }}>
                <div className="bg-gradient-to-r from-pink-500 to-red-500 p-3 rounded-full">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold text-gray-900">Sustainable Fashion</div>
                  <div className="text-gray-600">Reduce environmental impact</div>
                </div>
              </div>
            </div>

            {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    className="gradient-primary text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#latest-items">
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-8 py-4 text-lg font-semibold border-2 hover:bg-gray-50 transition-all duration-300 bg-transparent"
                  >
                    Browse Items
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center animate-fade-in-up">
              <div className="gradient-primary p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">10K+</div>
              <div className="text-gray-600 text-lg">Happy Users</div>
            </div>
            <div className="text-center animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <div className="gradient-accent p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Recycle className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">50K+</div>
              <div className="text-gray-600 text-lg">Items Exchanged</div>
            </div>
            <div className="text-center animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <div className="bg-gradient-to-r from-pink-500 to-red-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">100%</div>
              <div className="text-gray-600 text-lg">Secure Exchanges</div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Items */}
      <section id="latest-items" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Latest Items</h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover amazing pieces from our community of fashion enthusiasts
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {Array.from({ length: 8 }).map((_, index) => (
                <ItemCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {items.map((item, index) => (
                <Card
                  key={item.id}
                  className="overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border-0 shadow-lg animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    {item.images.length > 0 ? (
                      <img
                        src={item.images[0] || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=300&width=300"
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <img
                          src="/placeholder.svg?height=300&width=300"
                          alt="No image available"
                          className="w-full h-full object-cover opacity-50"
                        />
                      </div>
                    )}
                    <Badge className="absolute top-3 right-3 gradient-primary text-white shadow-lg">
                      {item.point_value} pts
                    </Badge>
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl line-clamp-1 text-gray-900">{item.title}</CardTitle>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary" className="text-xs font-medium">
                        {item.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Size {item.size}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {item.condition}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                      {item.description || "No description available"}
                    </p>

                    <Link href={`/items/${item.id}`}>
                      <Button className="w-full gradient-primary text-white shadow-lg hover:shadow-xl transition-all duration-300">
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {items.length === 0 && !loading && (
            <div className="text-center py-16 animate-fade-in-up">
              <div className="gradient-primary p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">No items available yet</h4>
              <p className="text-gray-600 text-lg mb-8">Be the first to add an amazing piece to our community!</p>
              {user && (
                <Link href="/items/new">
                  <Button className="gradient-primary text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                    Add Your First Item
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="gradient-primary p-3 rounded-xl">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <span className="text-3xl font-bold">ReWear</span>
            </div>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Building a sustainable future, one clothing exchange at a time. Join our community and make a difference.
            </p>
            <div className="mt-8 pt-8 border-t border-gray-800">
              <p className="text-gray-500">© 2024 ReWear. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function HomePageWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <HomePage />
    </ErrorBoundary>
  )
}
