# Raycast tools

A collection of personal [Raycast](https://www.raycast.com) tools.

## Contents

| Tool | Type | Description |
| --- | --- | --- |
| [`extensions/brandkit`](extensions/brandkit) | Extension (TS + React) | Find and copy colors from a design system. |
| [`scripts/random-generator.sh`](scripts/random-generator.sh) | Script Command (bash) | Generate a random string, password, or UUID and copy it to the clipboard. |

## brandkit

A Raycast extension for searching and copying design-system colors. See its
[README](extensions/brandkit/README.md) for usage, actions, and development commands.

```sh
cd extensions/brandkit
npm install
npm run dev      # live reload in Raycast
```

## random-generator.sh

A Raycast [Script Command](https://github.com/raycast/script-commands). Add this repo's
`scripts/` directory in Raycast (**Extensions → Script Commands → Add Directories**) to use it.

It wraps an external `randgen` Go binary, which is not included here. The script looks for
the binary in `$RANDGEN_BIN`, then `~/.local/bin/randgen`, then `$PATH`. Supported modes:
password, alphanumeric, number (each accepts an optional length) and UUID v4 / v7.
