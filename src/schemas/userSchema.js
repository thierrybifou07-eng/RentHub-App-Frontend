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
  password: passwordSchema,
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
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })
