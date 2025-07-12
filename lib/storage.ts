import { supabase } from "./supabase"

export const storageService = {
  async uploadItemImage(file: File, itemId: string): Promise<string> {
    const fileExt = file.name.split(".").pop()
    const fileName = `${itemId}-${Date.now()}.${fileExt}`
    const filePath = `items/${fileName}`

    const { error: uploadError } = await supabase.storage.from("items").upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from("items").getPublicUrl(filePath)

    return data.publicUrl
  },

  async deleteItemImage(imagePath: string) {
    const path = imagePath.split("/").pop()
    if (!path) return

    const { error } = await supabase.storage.from("items").remove([`items/${path}`])

    if (error) throw error
  },

  getImageUrl(path: string) {
    const { data } = supabase.storage.from("items").getPublicUrl(path)

    return data.publicUrl
  },
}
