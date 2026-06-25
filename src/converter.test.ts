import { describe, expect, it } from "vitest"
import {
  parseCidr,
  parseCidrList,
  prefixToNetmask,
  toBatRoutes,
  toAmneziaJson,
} from "./converter"

describe("CIDR parsing", () => {
  it("parses valid IPv4 CIDR entries and skips blank lines", () => {
    const result = parseCidrList(" 2.58.124.0/22 \n\n2.58.212.0/24\r\n")

    expect(result.invalid).toEqual([])
    expect(result.valid).toEqual([
      {
        original: "2.58.124.0/22",
        address: "2.58.124.0",
        prefix: 22,
        netmask: "255.255.252.0",
      },
      {
        original: "2.58.212.0/24",
        address: "2.58.212.0",
        prefix: 24,
        netmask: "255.255.255.0",
      },
    ])
  })

  it("keeps invalid non-empty lines in the invalid report", () => {
    const result = parseCidrList(
      "2.58.124.0/22\nnot-an-ip\n300.1.1.1/24\n1.1.1.1/33",
    )

    expect(result.valid).toHaveLength(1)
    expect(result.invalid).toEqual(["not-an-ip", "300.1.1.1/24", "1.1.1.1/33"])
  })

  it("rejects malformed CIDR values", () => {
    expect(parseCidr("2.58.124.0")).toBeNull()
    expect(parseCidr("2.58.124.0/-1")).toBeNull()
    expect(parseCidr("2.58.124.0/abc")).toBeNull()
    expect(parseCidr("2.58.124.256/24")).toBeNull()
  })
})

describe("netmask conversion", () => {
  it("converts CIDR prefixes to dotted decimal netmasks", () => {
    expect(prefixToNetmask(0)).toBe("0.0.0.0")
    expect(prefixToNetmask(8)).toBe("255.0.0.0")
    expect(prefixToNetmask(16)).toBe("255.255.0.0")
    expect(prefixToNetmask(22)).toBe("255.255.252.0")
    expect(prefixToNetmask(24)).toBe("255.255.255.0")
    expect(prefixToNetmask(32)).toBe("255.255.255.255")
  })

  it("throws for prefixes outside the CIDR range", () => {
    expect(() => prefixToNetmask(-1)).toThrow(RangeError)
    expect(() => prefixToNetmask(33)).toThrow(RangeError)
    expect(() => prefixToNetmask(24.5)).toThrow(RangeError)
  })
})

describe("output formats", () => {
  const entries = parseCidrList("2.58.124.0/22\n2.58.212.0/24").valid

  it("creates router BAT route commands", () => {
    expect(toBatRoutes(entries)).toBe(
      [
        "route add 2.58.124.0 mask 255.255.252.0 0.0.0.0",
        "route add 2.58.212.0 mask 255.255.255.0 0.0.0.0",
      ].join("\r\n"),
    )
  })

  it("creates pretty-printed Amnezia JSON", () => {
    expect(toAmneziaJson(entries)).toBe(
      JSON.stringify(
        [
          {
            hostname: "2.58.124.0/22",
            ip: "",
          },
          {
            hostname: "2.58.212.0/24",
            ip: "",
          },
        ],
        null,
        2,
      ),
    )
  })
})
