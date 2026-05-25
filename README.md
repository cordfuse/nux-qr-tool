# @cordfuse/nux-qr-tool

NUX MightyAmp QR preset encoder — generates decorated QR PNG cards from preset JSON.

Takes a JSON file describing a NUX MightyAmp tone preset (amp model, effects chain, device target) and outputs a dark-themed PNG card containing a scannable QR code. Works as both a CLI tool (via `npx`) and a Node.js library.

[![npm](https://img.shields.io/npm/v/@cordfuse/nux-qr-tool)](https://www.npmjs.com/package/@cordfuse/nux-qr-tool)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Used by

| Repo | How it's used |
|---|---|
| [cordfuse/toneai-nux-imprint](https://github.com/cordfuse/toneai-nux-imprint) | Agent invokes `npx @cordfuse/nux-qr-tool` to generate QR cards mid-conversation |
| [cordfuse/toneai-nux-cli](https://github.com/cordfuse/toneai-nux-cli) | Imports `decorateQR` as a library to decorate QR PNGs inside the compiled binary |

---

## Install

**Run without installing (recommended for agent use):**
```bash
npx @cordfuse/nux-qr-tool preset.json
```

**Install globally:**
```bash
npm install -g @cordfuse/nux-qr-tool
nux-qr-tool preset.json
```

**Install as a library:**
```bash
npm install @cordfuse/nux-qr-tool
```

---

## CLI Usage

```bash
npx @cordfuse/nux-qr-tool <preset-json-file> [--output <dir>]
```

Reads the preset JSON, encodes the NUX QR payload, generates a decorated PNG, writes it to `<dir>/<artist>-<song>.png`, and prints the full output path to stdout.

The output directory defaults to the current working directory. Use `--output` (or `-o`) to write elsewhere.

### Example

```bash
cat > preset.json << 'EOF'
{
  "artist": "Led Zeppelin",
  "song": "Whole Lotta Love",
  "device": "plugpro",
  "preset_name": "Page Sunburst",
  "preset_name_short": "Page SB",
  "amp": { "id": 3, "gain": 72, "master": 75, "bass": 55, "mid": 50, "treble": 48 },
  "cabinet": { "id": 5, "level_db": 0, "low_cut_hz": 80, "high_cut": 50 },
  "noise_gate": { "enabled": true, "sensitivity": 35, "decay": 50 },
  "efx": { "id": 7, "enabled": true, "p1": 60, "p2": 50, "p3": 55 },
  "reverb": { "id": 1, "enabled": true, "p1": 20, "p2": 40 },
  "master_db": 0
}
EOF

npx @cordfuse/nux-qr-tool preset.json
# → /current/working/dir/led-zeppelin-whole-lotta-love.png

npx @cordfuse/nux-qr-tool preset.json --output ./cards
# → ./cards/led-zeppelin-whole-lotta-love.png
```

The output directory is created automatically if it doesn't exist.

---

## Output Card

Each PNG is a 548×620px decorated card:

- **Header:** app name (top-left) and version (top-right) in red/grey on a dark background
- **QR code:** 500×500px, high error correction (level H), white on black
- **Footer:** artist and song title (bold), device name and embedded-name indicator

Pro format devices embed the preset name directly into the QR payload. The footer notes this with `· name embedded in QR`.

---

## Library Usage

```typescript
import { decorateQR } from '@cordfuse/nux-qr-tool'
```

### `decorateQR(qrPng, artist, song, deviceId, deviceName, options?)`

Takes a raw QR PNG buffer and adds the dark card decoration around it.

```typescript
import QRCode from 'qrcode'
import { decorateQR } from '@cordfuse/nux-qr-tool'

const qrBuffer = await QRCode.toBuffer('nux://MightyAmp:...', {
  errorCorrectionLevel: 'H',
  width: 500,
  margin: 4,
  color: { dark: '#000000', light: '#ffffff' },
}) as Buffer

const decorated = await decorateQR(
  qrBuffer,
  'Led Zeppelin',
  'Whole Lotta Love',
  'plugpro',
  'Mighty Plug Pro',
  { appName: 'my-app', appVersion: '1.0.0' }  // optional — defaults to 'ToneAI' + package version
)

fs.writeFileSync('output.png', decorated)
```

#### Parameters

| Param | Type | Description |
|---|---|---|
| `qrPng` | `Buffer` | Raw QR code PNG at 500×500px |
| `artist` | `string` | Artist name — shown in footer |
| `song` | `string` | Song title — shown in footer |
| `deviceId` | `string` | NUX device ID (e.g. `plugpro`) — determines footer note |
| `deviceName` | `string` | Human-readable device name — shown in footer |
| `options.appName` | `string` | App name in header (default: `'ToneAI'`) |
| `options.appVersion` | `string` | Version in header (default: package version) |

Returns `Promise<Buffer>` — the decorated PNG as a Buffer.

---

## Preset JSON Format

The CLI input JSON must include at minimum `artist`, `song`, `device`, and `amp`. All other fields are optional and default to off/zero.

### Top-level fields

| Field | Type | Required | Description |
|---|---|---|---|
| `artist` | `string` | yes | Artist name — used for output filename and card footer |
| `song` | `string` | yes | Song title — used for output filename and card footer |
| `device` | `string` | yes | Target NUX device ID (see Devices table below) |
| `preset_name` | `string` | yes | Full preset name |
| `preset_name_short` | `string` | no | Short name for Pro QR payload (max 15 chars) — falls back to `preset_name` |
| `amp` | `AmpParams` | yes | Amp model and EQ settings |
| `cabinet` | `CabinetParams` | no | Cabinet IR settings (Pro and most Standard devices) |
| `noise_gate` | `NoiseGateParams` | yes | Noise gate settings |
| `efx` | `EffectParams` | no | EFX slot (drive/wah effects) |
| `compressor` | `EffectParams` | no | Compressor (Pro format only) |
| `modulation` | `EffectParams` | no | Modulation effect |
| `delay` | `EffectParams` | no | Delay effect |
| `reverb` | `EffectParams` | no | Reverb effect |
| `eq` | `EQParams` | no | EQ (Pro format only) |
| `wah` | `WahParams` | no | Wah pedal (2040bt/40bt only) |
| `master_db` | `number` | yes | Master volume offset in dB (range: −12 to +12) |

### AmpParams

| Field | Type | Range | Description |
|---|---|---|---|
| `id` | `number` | device-specific | Amp model ID (nux index, 0- or 1-indexed depending on device) |
| `gain` | `number` | 0–100 | Gain |
| `master` | `number` | 0–100 | Master volume |
| `bass` | `number` | 0–100 | Bass EQ |
| `mid` | `number` | 0–100 | Mid EQ |
| `treble` | `number` | 0–100 | Treble EQ |
| `param6` | `number` | 0–100 | Amp-specific 6th parameter (presence, resonance, etc.) |
| `param7` | `number` | 0–100 | Amp-specific 7th parameter (rare) |

### CabinetParams

| Field | Type | Range | Description |
|---|---|---|---|
| `id` | `number` | device-specific | Cabinet IR model ID |
| `level_db` | `number` | −12 to +12 | Cabinet output level in dB |
| `low_cut_hz` | `number` | 20–300 | Low cut frequency |
| `high_cut` | `number` | 0–100 | High cut amount |

### NoiseGateParams

| Field | Type | Range | Description |
|---|---|---|---|
| `enabled` | `boolean` | — | Whether noise gate is active |
| `sensitivity` | `number` | 0–100 | Gate sensitivity (threshold) |
| `decay` | `number` | 0–100 | Gate decay/release |

### EffectParams (efx, compressor, modulation, delay, reverb)

| Field | Type | Range | Description |
|---|---|---|---|
| `id` | `number` | device-specific | Effect model ID (nux index) |
| `enabled` | `boolean` | — | Whether effect is active |
| `p1` | `number` | 0–100 | Parameter 1 |
| `p2` | `number` | 0–100 | Parameter 2 |
| `p3` | `number` | 0–100 | Parameter 3 (effect-dependent) |

### EQParams (Pro format only)

| Field | Type | Description |
|---|---|---|
| `id` | `number` | `1` = 6-Band, `3` = 10-Band |
| `enabled` | `boolean` | Whether EQ is active |
| `bands` | `number[]` | Per-band dB values (−15 to +15). 6 values for 6-Band, 11 for 10-Band |

### WahParams (2040bt and 40bt only)

| Field | Type | Range | Description |
|---|---|---|---|
| `enabled` | `boolean` | — | Whether wah is active |
| `pedal` | `number` | 0–100 | Pedal position |

---

## Devices

| ID | Device | Format | Notes |
|---|---|---|---|
| `plugpro` | Mighty Plug Pro | Pro (113 bytes) | Full chain, preset name in QR |
| `space` | Mighty Space | Pro (113 bytes) | Full chain, preset name in QR |
| `litemk2` | Mighty Lite MkII | Pro (113 bytes) | Full chain, preset name in QR |
| `8btmk2` | Mighty 8BT MkII | Pro (113 bytes) | Full chain, preset name in QR |
| `20btmk2` | Mighty 20BT MkII | Pro (113 bytes) | Full chain, preset name in QR |
| `40btmk2` | Mighty 40BT MkII | Pro (113 bytes) | Full chain, preset name in QR |
| `60btmk2` | Mighty 60BT MkII | Pro (113 bytes) | Full chain, preset name in QR |
| `plugair_v1` | Mighty Plug (v1) | Standard (40 bytes) | EFX slot, no preset name |
| `plugair_v2` | Mighty Plug (v2) | Standard (40 bytes) | EFX slot, no preset name |
| `mightyair_v1` | Mighty Air (v1) | Standard (40 bytes) | EFX slot, no preset name |
| `mightyair_v2` | Mighty Air (v2) | Standard (40 bytes) | EFX slot, no preset name |
| `mightygo` | Mighty Go | Standard (40 bytes) | EFX slot, no preset name |
| `lite` | Mighty Lite BT | Standard (40 bytes) | Single ambience slot (delay OR reverb) |
| `8bt` | Mighty 8BT | Standard (40 bytes) | Separate delay and reverb |
| `2040bt` | Mighty 20/40BT (original) | Standard (40 bytes) | Wah pedal, bass/mid/treble EQ |
| `40bt` | Mighty 40BT (original) | Standard (40 bytes) | Same format as 2040bt, separate QR ID |

### Pro vs Standard format

**Pro** devices use a 113-byte payload with the full effects chain (Compressor, EFX, Amp, EQ, Noise Gate, Modulation, Delay, Reverb, Cabinet) and embed the preset name in bytes 98–112.

**Standard** devices use a 40-byte device-specific payload. Amp and effect IDs are different from Pro devices and are 0-indexed. Cabinets and EQ are absent on Lite/8BT/2040BT. The Lite BT uses a single ambience slot shared between delay and reverb — reverb takes priority.

### QR string format

The encoded QR string has the form:

```
nux://MightyAmp:<base64>
```

Where the base64 decodes to `[deviceQRId, deviceQRVersion, ...payload]`.

---

## Requirements

- Node.js 18+ (for `npx` / global install)
- Or any runtime that can execute Node-compatible ESM (Bun, Deno with compat flag)

No external binaries required. Canvas rendering is handled by [`@napi-rs/canvas`](https://github.com/Brooooooklyn/canvas) — pre-built native binaries are downloaded automatically on install for Linux x64 (glibc and musl), macOS (arm64 and x64), and Windows x64.

---

## QR format reference

The NUX QR format was reverse-engineered from the open-source [mightier_amp](https://github.com/tuntorius/mightier_amp) Flutter app by [tuntorius](https://github.com/tuntorius). Key reference files: `NuxConstants.dart` and the per-device effect files under `lib/bluetooth/devices/effects/`.

---

## License

MIT
