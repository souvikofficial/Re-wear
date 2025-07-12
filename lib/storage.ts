import { supabase } from "./supabase"

/* =========================================================================
   Service
   ====================================================================== */
export const storageService = {
  /** Upload multiple images for an item */
  async uploadItemImages(files: File[]): Promise<string[]> {
    const uploadedUrls: string[] = []

    for (const file of files) {
      const filePath = `item_images/${Date.now()}-${file.name}`
      const { data, error } = await supabase.storage.from("rewear_images").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (error) {
        console.error("storageService.uploadItemImages error:", error)
        throw new Error(`Failed to upload image: ${file.name}.`)
      }

      const { data: publicUrlData } = supabase.storage.from("rewear_images").getPublicUrl(data.path)
      uploadedUrls.push(publicUrlData.publicUrl)
    }

    return uploadedUrls
  },

  /** Delete images by their public URLs */
  async deleteItemImages(urls: string[]) {
    const pathsToDelete = urls
      .map((url) => {
        // Extract path from public URL
        const urlParts = url.split("/")
        const bucketIndex = urlParts.indexOf("rewear_images")
        if (bucketIndex > -1) {
          return urlParts.slice(bucketIndex + 1).join("/")
        }
        return ""
      })
      .filter((path) => path !== "") // Filter out any empty paths

    if (pathsToDelete.length === 0) {
      return // Nothing to delete
    }

    const { error } = await supabase.storage.from("rewear_images").remove(pathsToDelete)

    if (error) {
      console.error("storageService.deleteItemImages error:", error)
      throw new Error("Failed to delete images.")
    }
  },
}
