"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth"
import { itemsService, type Item } from "@/lib/items"
import { swapsService, type Swap } from "@/lib/swaps"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Package, ArrowRightLeft, Plus, LogOut } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [userItems, setUserItems] = useState<Item[]>([])
  const [userSwaps, setUserSwaps] = useState<Swap[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      if (!currentUser) {
        router.push("/auth/login")
        return
      }

      const [profile, items, swaps] = await Promise.all([
        authService.getUserProfile(currentUser.id),
        itemsService.getUserItems(currentUser.id),
        swapsService.getUserSwaps(currentUser.id),
      ])

      setUser(currentUser)
      setUserProfile(profile)
      setUserItems(items)
      setUserSwaps(swaps)
    } catch (error) {
      console.error("Error loading dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await authService.signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!user || !userProfile) {
    return null
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

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">{userProfile.points} points</span>
              </div>
              <Button onClick={handleSignOut} variant="ghost" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {userProfile.name}!</h1>
          <p className="text-gray-600">Manage your items, track swaps, and grow your sustainable wardrobe.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProfile.points}</div>
              <p className="text-xs text-muted-foreground">Earned from successful swaps</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Items</CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userItems.length}</div>
              <p className="text-xs text-muted-foreground">Items in your closet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Swaps</CardTitle>
              <ArrowRightLeft className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userSwaps.filter((s) => s.status === "requested" || s.status === "accepted").length}
              </div>
              <p className="text-xs text-muted-foreground">Pending swap requests</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="items" className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="items">My Items</TabsTrigger>
              <TabsTrigger value="swaps">Swaps</TabsTrigger>
            </TabsList>

            <Link href="/items/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Item
              </Button>
            </Link>
          </div>

          <TabsContent value="items" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userItems.map((item) => (
                <Card key={item.id}>
                  <div className="aspect-square bg-gray-100 relative">
                    {item.images.length > 0 ? (
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

            {userItems.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No items yet</h3>
                <p className="text-gray-500 mb-4">Start by adding your first item to exchange</p>
                <Link href="/items/new">
                  <Button>Add Your First Item</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="swaps" className="space-y-6">
            <div className="space-y-4">
              {userSwaps.map((swap) => (
                <Card key={swap.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{swap.item?.title || "Unknown Item"}</CardTitle>
                        <CardDescription>
                          {swap.requester?.name || "Unknown User"} • {new Date(swap.requested_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          swap.status === "completed"
                            ? "default"
                            : swap.status === "accepted"
                              ? "secondary"
                              : swap.status === "rejected"
                                ? "destructive"
                                : "outline"
                        }
                      >
                        {swap.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">Points: {swap.item?.point_value || 0}</div>
                      <Link href={`/swaps/${swap.id}`}>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {userSwaps.length === 0 && (
              <div className="text-center py-12">
                <ArrowRightLeft className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No swaps yet</h3>
                <p className="text-gray-500 mb-4">Browse items to start your first swap</p>
                <Link href="/">
                  <Button>Browse Items</Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
