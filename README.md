# IP List Converter

Small static web app for converting IPv4 CIDR lists into:

- Windows/Keenetic `route add` commands in a `.bat` file
- Amnezia-compatible JSON entries

## Input Format

Upload a plain text or `.list` file with exactly one IPv4 CIDR network per line.

```text
2.58.124.0/22
2.58.212.0/24
```

Blank lines are ignored. Invalid non-empty lines are reported and skipped.

CSV is intentionally not supported. Rows such as `2.58.124.0/22,comment` are treated as invalid input.

## Development

```sh
pnpm install
pnpm run dev
```

## Quality Gates

```sh
pnpm run lint
pnpm run format:check
pnpm run test
pnpm run build
pnpm run check
```

`pnpm run check` is the CI gate and runs TypeScript, ESLint, Prettier check, tests, and the production build.

To format files locally:

```sh
pnpm run format
```

## Deployment Base Path

The default Vite base path is `/iplist-gen/`, suitable for GitHub Pages under that repository name.

Override it with `IPLIST_GEN_BASE` when building for another path:

```sh
IPLIST_GEN_BASE=/ pnpm run build
IPLIST_GEN_BASE=/tools/iplist-gen/ pnpm run build
```
