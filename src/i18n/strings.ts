import { localeStrings } from "./locales"
import type { LocaleMessages } from "./locales"
import type { Locale } from "./types"

export function getLocaleStrings(locale: Locale): LocaleMessages {
  return localeStrings[locale]
}
