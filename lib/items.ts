import { supabase } from "./supabase"

/** Very small UUID v4 matcher (no need for a full library) */
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
function isUuid(str: string) {
  return uuidRegex.test(str)
}

/* =========================================================================
   Types
   ====================================================================== */
export interface Item {
  id: string
  title: string
  description: string | null
  status: "active" | "pending" | "swapped" | "archived"
  owner_id: string
  point_value: number
  images: string[] | null
  created_at: string
  updated_at: string
  /* Joined owner data */
  owner?: {
    id: string
    name: string | null
    avatar_url: string | null
  }
}

/* =========================================================================
   Service
   ====================================================================== */
export const itemsService = {
  /** Get the newest “active” items including owner details */
  async getActiveItems(): Promise<Item[]> {
    const { data, error } = await supabase
      .from("items")
      // Explicit join avoids the “relationship not found” warning
      .select(
        `
          *,
          owner:users (
            id,
            name,
            avatar_url
          )
        `,
      )
      .eq("status", "active")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("itemsService.getActiveItems error:", error)
      throw new Error("Failed to load active items.")
    }

    return data as unknown as Item[]
  },

  /** Get a single item by ID (with owner) */
  async getItemById(id: string): Promise<Item | null> {
    // If it's not a valid UUID, short-circuit and return null
    if (!isUuid(id)) {
      console.warn("itemsService.getItemById called with non-UUID id:", id)
      return null
    }

    const { data, error } = await supabase
      .from("items")
      .select(
        `
          *,
          owner:users (
            id,
            name,
            avatar_url
          )
        `,
      )
      .eq("id", id)
      .maybeSingle()

    if (error) {
      console.error("itemsService.getItemById error:", error)
      throw new Error("Failed to fetch the item.")
    }

    return data as unknown as Item | null
  },

  /** Create a new item for the signed-in user */
  async createItem(newItem: Omit<Item, "id" | "created_at" | "updated_at" | "owner">) {
    const { data, error } = await supabase.from("items").insert(newItem).select().single()

    if (error) {
      console.error("itemsService.createItem error:", error)
      throw new Error("Failed to create item.")
    }

    return data as unknown as Item
  },

  /** Update an existing item (only its owner may do so) */
  async updateItem(id: string, updates: Partial<Item>) {
    const { data, error } = await supabase.from("items").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("itemsService.updateItem error:", error)
      throw new Error("Failed to update item.")
    }

    return data as unknown as Item
  },

  /** All items that belong to a given user (dashboard list) */
  async getUserItems(userId: string): Promise<Item[]> {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("itemsService.getUserItems error:", error)
      throw new Error("Failed to load user items.")
    }

    return data ?? []
  },

  /** Realtime subscription to any change on items (insert/update/delete) */
  subscribeToItems(callback: (payload: any) => void) {
    return supabase
      .channel("public:items")
      .on("postgres_changes", { event: "*", schema: "public", table: "items" }, callback)
      .subscribe()
  },

  /** Soft-archive an item */
  async archiveItem(id: string) {
    const { error } = await supabase.from("items").update({ status: "archived" }).eq("id", id)

    if (error) {
      console.error("itemsService.archiveItem error:", error)
      throw new Error("Failed to archive item.")
    }
  },
}

export const { getActiveItems, getItemById, getUserItems, createItem, updateItem, archiveItem, subscribeToItems } =
  itemsService
