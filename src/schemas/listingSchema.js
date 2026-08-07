import { z } from "zod"

export const listingFilterSchema = z.object({
  city_id: z.coerce.number().int().positive().optional().or(z.literal("")),
  property_type_id: z.coerce.number().int().positive().optional().or(z.literal("")),
  minPrice: z.coerce.number().nonnegative().optional().or(z.literal("")),
  maxPrice: z.coerce.number().positive().optional().or(z.literal("")),
  minRooms: z.coerce.number().int().nonnegative().optional().or(z.literal("")),
  maxRooms: z.coerce.number().int().positive().optional().or(z.literal("")),
  search: z.string().max(255).optional().or(z.literal("")),
  sort: z.enum(["price_asc", "price_desc", "newest", "oldest"]).optional().or(z.literal("")),
  furnished: z.coerce.boolean().optional().or(z.literal("")),
})

export const listingFormSchema = z.object({
  title: z
    .string()
    .min(3, "Le titre doit contenir au moins 3 caractères")
    .max(255, "Le titre ne peut dépasser 255 caractères"),
  price: z.coerce
    .number({ invalid_type_error: "Le prix doit être un nombre" })
    .positive("Le prix doit être positif")
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(val.toString()), {
      message: "Le prix peut avoir au maximum 2 décimales",
    }),
  surface_area: z.coerce
    .number()
    .positive("La surface doit être positive")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  rooms: z.coerce
    .number()
    .int()
    .nonnegative()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  bedrooms: z.coerce
    .number()
    .int()
    .nonnegative()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  bathrooms: z.coerce
    .number()
    .int()
    .nonnegative()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  furnished: z.boolean().optional().default(false),
  property_type_id: z.coerce
    .number({ invalid_type_error: "Veuillez sélectionner un type de bien" })
    .int()
    .positive("Veuillez sélectionner un type de bien"),
  city_id: z.coerce
    .number({ invalid_type_error: "Veuillez sélectionner une ville" })
    .int()
    .positive("Veuillez sélectionner une ville"),
  description: z.string().optional().or(z.literal("")),
})
