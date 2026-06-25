import { localeStrings } from "./locales"
import type { Locale, PluralForms } from "./types"

const pluralRules: Record<Locale, Intl.PluralRules> = {
  en: new Intl.PluralRules("en"),
  ru: new Intl.PluralRules("ru"),
}

const numberFormatters: Record<Locale, Intl.NumberFormat> = {
  en: new Intl.NumberFormat("en"),
  ru: new Intl.NumberFormat("ru"),
}

export function formatBytes(locale: Locale, bytes: number): string {
  const units = localeStrings[locale].byteUnits
  let value = bytes
  let unitIndex = 0

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }

  const precision = unitIndex === 0 || value >= 10 ? 0 : 1
  const unit = units[unitIndex] ?? units[0]

  return `${numberFormatters[locale].format(
    Number(value.toFixed(precision)),
  )} ${unit}`
}

export function formatLineCount(locale: Locale, count: number): string {
  const forms = localeStrings[locale].lineForms
  const rule = pluralRules[locale].select(count)
  const word = selectCountForm(forms, rule)

  return `${numberFormatters[locale].format(count)} ${word}`
}

function selectCountForm(
  forms: PluralForms,
  rule: Intl.LDMLPluralRule,
): string {
  switch (rule) {
    case "one":
      return forms.one
    case "few":
      return forms.few ?? forms.other
    case "many":
      return forms.many ?? forms.other
    default:
      return forms.other
  }
}
