import type { Locale } from "../types"
import type { PluralForms } from "../types"
import enMessages from "./en.json"
import ruMessages from "./ru.json"

export type LocaleMessages = Omit<
  typeof enMessages,
  "byteUnits" | "lineForms"
> & {
  byteUnits: readonly string[]
  lineForms: PluralForms
}

const en = enMessages satisfies LocaleMessages
const ru = ruMessages satisfies LocaleMessages

export const localeStrings: Record<Locale, LocaleMessages> = {
  en,
  ru,
}
