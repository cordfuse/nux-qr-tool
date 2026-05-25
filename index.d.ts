export declare function decorateQR(
  qrPng: Buffer,
  artist: string,
  song: string,
  deviceId: string,
  deviceName: string,
  options?: { appName?: string; appVersion?: string },
): Promise<Buffer>

export type DeviceType =
  | 'plugpro' | 'space' | 'litemk2' | '8btmk2' | '20btmk2' | '40btmk2' | '60btmk2'
  | 'plugair_v1' | 'plugair_v2' | 'mightyair_v1' | 'mightyair_v2' | 'mightygo'
  | 'lite' | '8bt' | '2040bt' | '40bt'

export interface DeviceConfig {
  deviceQRId: number
  deviceQRVersion: number
  format: 'pro' | 'standard'
  displayName: string
}

export interface PresetParams {
  artist: string
  song: string
  device: DeviceType
  preset_name: string
  preset_name_short?: string
  amp: { id: number; gain: number; master: number; bass: number; mid: number; treble: number; param6?: number; param7?: number }
  cabinet?: { id: number; level_db: number; low_cut_hz: number; high_cut: number }
  noise_gate: { enabled: boolean; sensitivity: number; decay: number }
  wah?: { enabled: boolean; pedal: number }
  efx?: { id: number; enabled: boolean; p1: number; p2: number; p3?: number }
  compressor?: { id: number; enabled: boolean; p1: number; p2: number; p3?: number }
  modulation?: { id: number; enabled: boolean; p1: number; p2: number; p3?: number }
  delay?: { id: number; enabled: boolean; p1: number; p2: number; p3?: number }
  reverb?: { id: number; enabled: boolean; p1: number; p2: number; p3?: number }
  eq?: { id: number; enabled: boolean; bands: number[] }
  master_db: number
}

export declare const DEVICES: Record<DeviceType, DeviceConfig>

export declare function coerceParams(raw: Record<string, unknown>): PresetParams

export declare function buildQRString(params: PresetParams): string
