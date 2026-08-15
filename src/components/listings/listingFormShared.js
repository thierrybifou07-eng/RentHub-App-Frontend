import { Camera, Home, Info } from "lucide-react"

export const EMPTY_FORM = {
  title: "",
  property_type_id: "",
  price: "",
  city_id: "",
  surface_area: "",
  rooms: "",
  bedrooms: "",
  bathrooms: "",
  furnished: false,
  description: "",
}

export const WIZARD_STEPS = [
  { key: "general", label: "Informations", icon: Info },
  { key: "details", label: "Caractéristiques", icon: Home },
  { key: "media", label: "Médias", icon: Camera },
]

export const STEP_FIELDS = {
  0: ["title", "property_type_id", "price", "city_id", "surface_area"],
  1: ["rooms", "bedrooms", "bathrooms", "description"],
  2: [],
}
