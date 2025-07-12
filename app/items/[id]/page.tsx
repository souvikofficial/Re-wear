"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { authService } from "@/lib/auth"
import { itemsService, type Item } from "@/lib/items"
import { swapsService } from "@/lib/swaps"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Star, User, Calendar, Tag } from "lucide-react"
import Link from "next/link"

export default function ItemDetailPage() {
  const [item, setItem] = useState<Item | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [swapLoading, setSwapLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const params = useParams()
  const router = useRouter()
  const itemId = params.id as string

  useEffect(() => {
    loadItemData()
  }, [itemId])

  const loadItemData = async () => {
    try {
      const [itemData, userData] = await Promise.all([itemsService.getItemById(itemId), authService.getCurrentUser()])

      setItem(itemData)
      setUser(userData)
    } catch (error) {
      console.error("Error loading item:", error)
      setError("Item not found")
    } finally {
      setLoading(false)
    }
  }

  const handleSwapRequest = async () => {
    if (!user || !item) return

    setSwapLoading(true)
    setError("")
    setSuccess("")

    try {
      await swapsService.createSwapRequest(item.id, user.id)
      setSuccess("Swap request sent successfully!")
    } catch (err: any) {
      setError(err.message || "Failed to send swap request")
    } finally {
      setSwapLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold mb-2">Item Not Found</h2>
            <p className="text-gray-600 mb-4">The item you're looking for doesn't exist.</p>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isOwner = user?.id === item.owner_id
  const canSwap = user && !isOwner && item.status === "active"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Browse
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {item.images.length > 0 ? (
                <img
                  src={item.images[currentImageIndex] || "/placeholder.svg"}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=400&width=400"
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <img
                      src="/placeholder.svg?height=400&width=400"
                      alt="No image available"
                      className="w-full h-full object-cover opacity-50"
                    />
                  </div>
                </div>
              )}
            </div>

            {item.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {item.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      currentImageIndex === index ? "border-green-600" : "border-gray-200"
                    }`}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${item.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=100&width=100"
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{item.title}</h1>
                <Badge className="bg-green-600 text-lg px-3 py-1">{item.point_value} pts</Badge>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">{item.category}</Badge>
                <Badge variant="outline">Size {item.size}</Badge>
                <Badge variant="outline">{item.condition}</Badge>
                <Badge variant={item.status === "active" ? "default" : "secondary"}>{item.status}</Badge>
              </div>

              {item.description && <p className="text-gray-700 text-lg leading-relaxed">{item.description}</p>}
            </div>

            {/* Tags */}
            {item.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <Tag className="h-4 w-4 mr-1" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Owner Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Owner Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{item.owner?.name || "Unknown"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Points:</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="font-medium">{item.owner?.points || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Listed:</span>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {!user ? (
                <div className="space-y-2">
                  <Link href="/auth/login">
                    <Button className="w-full" size="lg">
                      Sign In to Request Swap
                    </Button>
                  </Link>
                  <p className="text-sm text-gray-600 text-center">You need to be signed in to request a swap</p>
                </div>
              ) : isOwner ? (
                <div className="space-y-2">
                  <Link href={`/items/${item.id}/edit`}>
                    <Button className="w-full bg-transparent" size="lg" variant="outline">
                      Edit Item
                    </Button>
                  </Link>
                  <p className="text-sm text-gray-600 text-center">This is your item</p>
                </div>
              ) : canSwap ? (
                <Button onClick={handleSwapRequest} disabled={swapLoading} className="w-full" size="lg">
                  {swapLoading ? "Sending Request..." : "Request Swap"}
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button disabled className="w-full" size="lg">
                    Not Available for Swap
                  </Button>
                  <p className="text-sm text-gray-600 text-center">This item is currently {item.status}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
