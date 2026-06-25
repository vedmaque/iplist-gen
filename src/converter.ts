export interface ParsedCidr {
  original: string
  address: string
  prefix: number
  netmask: string
}

export interface ParseResult {
  valid: ParsedCidr[]
  invalid: string[]
}

const CIDR_PATTERN = /^(\d{1,3}(?:\.\d{1,3}){3})\/(\d{1,2})$/

export function parseCidrList(input: string): ParseResult {
  const valid: ParsedCidr[] = []
  const invalid: string[] = []

  for (const rawLine of input.split(/\r?\n/)) {
    const line = rawLine.trim()

    if (line.length === 0) {
      continue
    }

    const parsed = parseCidr(line)

    if (parsed) {
      valid.push(parsed)
    } else {
      invalid.push(line)
    }
  }

  return { valid, invalid }
}

export function toBatRoutes(entries: ParsedCidr[]): string {
  return entries
    .map((entry) => `route add ${entry.address} mask ${entry.netmask} 0.0.0.0`)
    .join("\r\n")
}

export function toAmneziaJson(entries: ParsedCidr[]): string {
  const payload = entries.map((entry) => ({
    hostname: entry.original,
    ip: "",
  }))

  return JSON.stringify(payload, null, 2)
}

export function parseCidr(value: string): ParsedCidr | null {
  const match = value.match(CIDR_PATTERN)

  if (!match) {
    return null
  }

  const [, address, prefixValue] = match
  const prefix = Number(prefixValue)

  if (
    !address ||
    !isValidIpv4(address) ||
    !Number.isInteger(prefix) ||
    prefix < 0 ||
    prefix > 32
  ) {
    return null
  }

  return {
    original: value,
    address,
    prefix,
    netmask: prefixToNetmask(prefix),
  }
}

export function prefixToNetmask(prefix: number): string {
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
    throw new RangeError("CIDR prefix must be an integer between 0 and 32.")
  }

  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0

  return [24, 16, 8, 0].map((shift) => (mask >>> shift) & 255).join(".")
}

function isValidIpv4(address: string): boolean {
  const octets = address.split(".")

  return octets.every((octet) => {
    if (!/^\d+$/.test(octet)) {
      return false
    }

    const value = Number(octet)
    return Number.isInteger(value) && value >= 0 && value <= 255
  })
}
