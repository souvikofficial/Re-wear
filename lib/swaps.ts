import { supabase } from "./supabase"

/* =========================================================================
   Types
   ====================================================================== */
export interface Swap {
  id: string
  item_id: string
  requester_id: string
  status: "pending" | "accepted" | "rejected" | "completed"
  requested_at: string

  /* Joined data */
  item?: {
    id: string
    title: string
    point_value: number
    images: string[] | null
    owner_id: string
  }
  requester?: {
    id: string
    name: string | null
    avatar_url: string | null
  }
}

/* =========================================================================
   Helpers
   ====================================================================== */
function _wrapError(scope: string, error: any) {
  console.error(`${scope} error:`, error)
  throw new Error("Something went wrong. Please try again.")
}

/* =========================================================================
   Service
   ====================================================================== */
export const swapsService = {
  /* ---------------------------------------------------------------------
   * Create a new swap request
   * ------------------------------------------------------------------ */
  async requestSwap(itemId: string, requesterId: string): Promise<Swap> {
    // Ensure the item exists and we know its owner (needed elsewhere).
    const { data: item, error: itemErr } = await supabase
      .from("items")
      .select("owner_id")
      .eq("id", itemId)
      .maybeSingle()

    if (itemErr || !item) {
      _wrapError("swapsService.requestSwap (lookup item)", itemErr)
    }

    const { data, error } = await supabase
      .from("swaps")
      .insert({
        item_id: itemId,
        requester_id: requesterId,
        status: "pending",
      })
      .select()
      .single()

    if (error) _wrapError("swapsService.requestSwap (insert)", error)

    return data as unknown as Swap
  },

  /* ---------------------------------------------------------------------
   * Get all swaps where the current user is either the requester OR
   * the owner of the item being requested.
   * ------------------------------------------------------------------ */
  async getUserSwaps(userId: string): Promise<Swap[]> {
    const { data, error } = await supabase
      .from("swaps")
      .select(
        `
          *,
          item:items (
            id,
            title,
            point_value,
            images,
            owner_id
          ),
          requester:users (
            id,
            name,
            avatar_url
          )
        `,
      )
      // requester_id == user OR item.owner_id == user
      .or(`requester_id.eq.${userId},item.owner_id.eq.${userId}`)
      .order("requested_at", { ascending: false })

    if (error) _wrapError("swapsService.getUserSwaps", error)

    return data as unknown as Swap[]
  },

  /* ---------------------------------------------------------------------
   * Update swap status
   * ------------------------------------------------------------------ */
  async updateSwapStatus(id: string, status: Swap["status"]): Promise<Swap> {
    const { data, error } = await supabase.from("swaps").update({ status }).eq("id", id).select().single()

    if (error) _wrapError("swapsService.updateSwapStatus", error)

    return data as unknown as Swap
  },
}
