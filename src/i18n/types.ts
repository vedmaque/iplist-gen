import type { SUPPORTED_LOCALES } from "./constants"

export type Locale = (typeof SUPPORTED_LOCALES)[number]

export type PluralForms = {
  one: string
  few?: string
  many?: string
  other: string
}
