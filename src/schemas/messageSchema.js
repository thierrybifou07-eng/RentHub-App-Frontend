import { z } from "zod"

export const messageFormSchema = z.object({
  text: z
    .string()
    .min(1, "Le message ne peut être vide")
    .max(2000, "Le message ne peut dépasser 2000 caractères"),
})
