"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { itemsService, type Item } from "@/lib/items"
import { authService } from "@/lib/auth"
import { swapsService } from "@/lib/swaps"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Star, User2, Calendar, Package, Trash2 } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"

export default function ItemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const itemId = params.id as string

  const [item, setItem] = useState<Item | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [isRequestingSwap, setIsRequestingSwap] = useState(false)

  useEffect(() => {
    loadItemData()
  }, [itemId])

  const loadItemData = async () => {
    if (itemId === "new") {
      router.push("/items/new")
      return
    }

    try {
      setLoading(true)
      const [fetchedItem, user] = await Promise.all([itemsService.getItemById(itemId), authService.getCurrentUser()])

      if (!fetchedItem) {
        router.push("/404") // Or a custom not-found page
        return
      }

      setItem(fetchedItem)
      setCurrentUser(user)
      setIsOwner(user?.id === fetchedItem.owner_id)
    } catch (error) {
      console.error("Error loading item data:", error)
      toast({
        title: "Error",
        description: "Failed to load item details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRequestSwap = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to request a swap.",
        variant: "default",
      })
      router.push("/auth/login")
      return
    }
    if (!item) return

    setIsRequestingSwap(true)
    try {
      await swapsService.requestSwap(item.id, currentUser.id, item.owner_id)
      toast({
        title: "Swap Requested!",
        description: "Your swap request has been sent to the item owner.",
        variant: "success",
      })
    } catch (error) {
      console.error("Error requesting swap:", error)
      toast({
        title: "Error",
        description: "Failed to send swap request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRequestingSwap(false)
    }
  }

  const handleArchiveItem = async () => {
    if (!item) return
    try {
      await itemsService.archiveItem(item.id)
      toast({
        title: "Item Archived",
        description: "Your item has been moved to your archived items.",
        variant: "success",
      })
      router.push("/dashboard")
    } catch (error) {
      console.error("Error archiving item:", error)
      toast({
        title: "Error",
        description: "Failed to archive item. Please try again.",
        variant: "destructive",
      })
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
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-500">
        <Package className="h-24 w-24 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Item Not Found</h2>
        <p className="mb-6">The item you are looking for does not exist or has been removed.</p>
        <Link href="/">
          <Button>Browse All Items</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {item.images && item.images.length > 0 ? (
              <Carousel className="w-full">
                <CarouselContent>
                  {item.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="aspect-square w-full">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`${item.title} image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=600&width=600"
                          }}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            ) : (
              <div className="aspect-square w-full bg-gray-100 flex items-center justify-center text-gray-400">
                <img
                  src="/placeholder.svg?height=600&width=600"
                  alt="No image available"
                  className="w-full h-full object-cover opacity-50"
                />
              </div>
            )}
          </CardContent>
          <CardHeader className="p-6">
            <div className="flex justify-between items-start mb-2">
              <CardTitle className="text-3xl font-bold">{item.title}</CardTitle>
              <Badge
                className={`${
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
            <CardDescription className="text-lg text-gray-700">{item.description}</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-2 text-yellow-500" />
                <span>{item.point_value} points</span>
              </div>
              <div className="flex items-center">
                <Package className="h-4 w-4 mr-2 text-blue-500" />
                <span>Category: {item.category}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                <span>Size: {item.size}</span>
              </div>
              <div className="flex items-center">
                <User2 className="h-4 w-4 mr-2 text-gray-500" />
                <span>Owner: {item.owner?.name || "Unknown"}</span>
              </div>
            </div>

            <div className="flex gap-4">
              {!isOwner && item.status === "active" && (
                <Button onClick={handleRequestSwap} disabled={isRequestingSwap}>
                  {isRequestingSwap ? "Requesting..." : "Request Swap"}
                </Button>
              )}
              {isOwner && item.status === "active" && (
                <>
                  <Link href={`/items/edit/${item.id}`}>
                    <Button variant="outline">Edit Item</Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" /> Archive Item
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will archive your item. It will no longer be visible for swaps. You can reactivate
                          it later from your dashboard.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleArchiveItem}>Archive</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
              {isOwner && item.status !== "active" && <Button disabled>Item {item.status}</Button>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
