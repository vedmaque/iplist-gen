import { defineConfig, loadEnv } from "vite"

const DEFAULT_BASE = "/iplist-gen/"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "")

  return {
    base: normalizeBase(env.IPLIST_GEN_BASE ?? DEFAULT_BASE),
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
