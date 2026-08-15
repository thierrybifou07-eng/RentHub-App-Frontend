import { z } from "zod"

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])(?!.*(.)\1\1\1)[A-Za-z\d@$!%*?&]{8,}$/

const PASSWORD_MESSAGE =
  "Le mot de passe doit contenir au moins 8 caractères, dont une minuscule, une majuscule, un chiffre et un caractère spécial (@$!%*?&), sans répéter le même caractère plus de 3 fois"

export const passwordSchema = z
  .string()
  .min(1, "Le mot de passe est requis")
  .regex(PASSWORD_REGEX, PASSWORD_MESSAGE)

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'adresse e-mail est requise")
    .email("Adresse e-mail invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
})

export const registerSchema = z
  .object({
    firstname: z
      .string()
      .min(1, "Le prénom est requis")
      .min(3, "Le prénom doit contenir au moins 3 caractères")
      .max(100, "Le prénom ne peut dépasser 100 caractères"),
    lastname: z
      .string()
      .min(1, "Le nom est requis")
      .min(3, "Le nom doit contenir au moins 3 caractères")
      .max(100, "Le nom ne peut dépasser 100 caractères"),
    email: z
      .string()
      .min(1, "L'adresse e-mail est requise")
      .email("Adresse e-mail invalide"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirmez votre mot de passe"),
    acceptedTerms: z.boolean().refine((v) => v === true, {
      message: "Vous devez accepter les Conditions Générales d'Utilisation",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "L'adresse e-mail est requise")
    .email("Adresse e-mail invalide"),
})

export const resetPasswordSchema = z
  .object({
    email: z.string().email(),
    code: z
      .string()
      .min(6, "Le code doit contenir 6 chiffres")
      .max(6, "Le code doit contenir 6 chiffres")
      .regex(/^\d+$/, "Le code ne doit contenir que des chiffres"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirmez votre mot de passe"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })

export const verifyEmailSchema = z.object({
  code: z
    .string()
    .min(6, "Le code doit contenir 6 chiffres")
    .max(6, "Le code doit contenir 6 chiffres")
    .regex(/^\d+$/, "Le code ne doit contenir que des chiffres"),
})

export const updateProfileSchema = z.object({
  firstname: z
    .string()
    .min(3, "Le prénom doit contenir au moins 3 caractères")
    .max(100, "Le prénom ne peut dépasser 100 caractères")
    .optional(),
  lastname: z
    .string()
    .min(3, "Le nom doit contenir au moins 3 caractères")
    .max(100, "Le nom ne peut dépasser 100 caractères")
    .optional(),
  gender: z.enum(["M", "F"]).optional(),
  phone: z.string().max(20).optional().nullable(),
  cityId: z.number().int().positive().optional().nullable(),
})

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, "Confirmez votre nouveau mot de passe"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmNewPassword"],
  })

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Le mot de passe est requis pour supprimer le compte"),
})
