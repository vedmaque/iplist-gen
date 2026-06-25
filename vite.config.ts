import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { defineConfig, loadEnv, type Plugin } from "vite"

const DEFAULT_BASE = "/iplist-gen/"
const DEFAULT_LOCALE_PATH = "src/i18n/locales/en.json"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "")

  return {
    base: normalizeBase(env.IPLIST_GEN_BASE ?? DEFAULT_BASE),
    plugins: [i18nHtmlPlugin(DEFAULT_LOCALE_PATH)],
  }
})

function normalizeBase(base: string): string {
  const trimmed = base.trim()

  if (trimmed === "" || trimmed === "/") {
    return "/"
  }

  if (trimmed === "./") {
    return trimmed
  }

  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`

  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash
    : `${withLeadingSlash}/`
}

function i18nHtmlPlugin(localePath: string): Plugin {
  return {
    name: "iplist-gen:i18n-html",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        const messages = loadLocaleMessages(localePath)

        return html.replace(/%i18n\.([\w.]+)%/g, (placeholder, key: string) => {
          const value = messages[key]

          if (typeof value !== "string") {
            throw new Error(`Missing string value for HTML i18n key "${key}".`)
          }

          return escapeHtml(value)
        })
      },
    },
  }
}

function loadLocaleMessages(localePath: string): Record<string, unknown> {
  return JSON.parse(readFileSync(resolve(localePath), "utf8")) as Record<
    string,
    unknown
  >
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}
