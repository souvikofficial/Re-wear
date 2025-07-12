import { supabase, type Swap } from "./supabase"

export const swapsService = {
  async createSwapRequest(itemId: string, requesterId: string): Promise<Swap> {
    const { data, error } = await supabase
      .from("swaps")
      .insert({
        item_id: itemId,
        requester_id: requesterId,
        status: "requested",
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getUserSwaps(userId: string): Promise<Swap[]> {
    const { data, error } = await supabase
      .from("swaps")
      .select(`
        *,
        item:items(*),
        requester:users(*)
      `)
      .or(`requester_id.eq.${userId},item_id.in.(select id from items where owner_id = '${userId}')`)
      .order("requested_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async updateSwapStatus(swapId: string, status: Swap["status"]): Promise<Swap> {
    const { data, error } = await supabase.from("swaps").update({ status }).eq("id", swapId).select().single()

    if (error) throw error
    return data
  },

  async completeSwap(swapId: string) {
    // Update swap status
    await this.updateSwapStatus(swapId, "completed")

    // Get swap details
    const { data: swap, error: swapError } = await supabase
      .from("swaps")
      .select(`
        *,
        item:items(*)
      `)
      .eq("id", swapId)
      .single()

    if (swapError) throw swapError

    // Award points to item owner
    const { error: pointsError } = await supabase.from("points_transactions").insert({
      user_id: swap.item.owner_id,
      type: "earn",
      amount: swap.item.point_value,
      swap_id: swapId,
    })

    if (pointsError) throw pointsError

    // Update user points
    const { error: userError } = await supabase.rpc("increment_user_points", {
      user_id: swap.item.owner_id,
      points: swap.item.point_value,
    })

    if (userError) throw userError

    // Update item status
    await supabase.from("items").update({ status: "swapped" }).eq("id", swap.item_id)
  },
}
