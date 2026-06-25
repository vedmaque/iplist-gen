import { SUPPORTED_LOCALES } from "./constants"
import type { Locale } from "./types"

export function detectLocale(languages = getBrowserLanguages()): Locale {
  for (const language of languages) {
    const locale = language.toLowerCase().split("-")[0] ?? ""

    if (isSupportedLocale(locale)) {
      return locale
    }
  }

  return "en"
}

function getBrowserLanguages(): readonly string[] {
  if (typeof navigator === "undefined") {
    return []
  }

  if (navigator.languages.length > 0) {
    return navigator.languages
  }

  return navigator.language ? [navigator.language] : []
}

function isSupportedLocale(locale: string): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as Locale)
}
