import { z } from "zod"

export const reportSchema = z.object({
  reason: z
    .string({ required_error: "La raison est obligatoire." })
    .min(10, "La raison doit contenir au moins 10 caractères.")
    .max(2000, "La raison ne peut excéder 2000 caractères."),
})
