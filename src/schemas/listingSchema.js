import { z } from "zod"
import { CAMEROON_CITIES, PROPERTY_TYPES, BUDGET_RANGES, LISTING_STATUS } from "../constants/listingOptions"

const cityValues = CAMEROON_CITIES
const typeValues = PROPERTY_TYPES.map((t) => t.value)
const statusValues = Object.keys(LISTING_STATUS)
const budgetValues = BUDGET_RANGES.map((b) => b.value)

export const listingFilterSchema = z.object({
  city: z.enum(cityValues).optional().or(z.literal("")),
  type: z.enum(typeValues).optional().or(z.literal("")),
  budget: z.enum(budgetValues).optional().or(z.literal("")),
  rooms: z.coerce.number().int().min(1).max(10).optional().or(z.nan()),
  status: z.enum(statusValues).optional().or(z.literal("")),
  search: z.string().max(100).optional().or(z.literal("")),
})

export const listingFormSchema = z.object({
  title: z
    .string()
    .min(5, "Le titre doit contenir au moins 5 caractères")
    .max(100, "Le titre ne peut dépasser 100 caractères"),
  type: z.enum(typeValues, { message: "Sélectionnez un type de bien" }),
  price: z
    .number({ message: "Le prix doit être un nombre" })
    .int("Le prix doit être un nombre entier")
    .positive("Le prix doit être positif"),
  city: z.enum(cityValues, { message: "Sélectionnez une ville" }),
  neighborhood: z
    .string()
    .min(2, "Le quartier doit contenir au moins 2 caractères")
    .max(50, "Le quartier ne peut dépasser 50 caractères"),
  rooms: z
    .number({ message: "Le nombre de chambres doit être un nombre" })
    .int("Le nombre de chambres doit être entier")
    .min(1, "Minimum 1 chambre")
    .max(10, "Maximum 10 chambres"),
  description: z
    .string()
    .min(20, "La description doit contenir au moins 20 caractères")
    .max(2000, "La description ne peut dépasser 2000 caractères"),
})
