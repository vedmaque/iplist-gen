import { describe, expect, it } from "vitest"
import { detectLocale, formatBytes, formatLineCount } from "./i18n/index"

describe("locale detection", () => {
  it("uses Russian when it is the first supported browser language", () => {
    expect(detectLocale(["ru-RU", "en-US"])).toBe("ru")
  })

  it("uses English when it is the first supported browser language", () => {
    expect(detectLocale(["en-GB", "ru-RU"])).toBe("en")
  })

  it("falls back to English for unsupported browser languages", () => {
    expect(detectLocale(["de-DE", "fr-FR"])).toBe("en")
  })
})

describe("localized formatting", () => {
  it("formats English line counts", () => {
    expect(formatLineCount("en", 1)).toBe("1 line")
    expect(formatLineCount("en", 2)).toBe("2 lines")
  })

  it("formats Russian line counts", () => {
    expect(formatLineCount("ru", 1)).toBe("1 строка")
    expect(formatLineCount("ru", 2)).toBe("2 строки")
    expect(formatLineCount("ru", 5)).toBe("5 строк")
  })

  it("formats bytes with localized units", () => {
    expect(formatBytes("en", 1024)).toBe("1 KB")
    expect(formatBytes("ru", 1024)).toBe("1 КБ")
  })
})
