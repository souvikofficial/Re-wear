import { supabase, type Item } from "./supabase"

export const itemsService = {
  async getActiveItems(limit = 10): Promise<Item[]> {
    const { data, error } = await supabase
      .from("items")
      .select(`
        *,
        owner:users(*)
      `)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  },

  async getItemById(id: string): Promise<Item> {
    const { data, error } = await supabase
      .from("items")
      .select(`
        *,
        owner:users(*)
      `)
      .eq("id", id)
      .single()

    if (error) throw error
    return data
  },

  async getUserItems(userId: string): Promise<Item[]> {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async createItem(item: Omit<Item, "id" | "created_at" | "owner">): Promise<Item> {
    const { data, error } = await supabase.from("items").insert(item).select().single()

    if (error) throw error
    return data
  },

  async updateItem(id: string, updates: Partial<Item>): Promise<Item> {
    const { data, error } = await supabase.from("items").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  },

  async deleteItem(id: string) {
    const { error } = await supabase.from("items").delete().eq("id", id)

    if (error) throw error
  },

  subscribeToItems(callback: (payload: any) => void) {
    return supabase
      .channel("public:items")
      .on("postgres_changes", { event: "*", schema: "public", table: "items" }, callback)
      .subscribe()
  },
}
