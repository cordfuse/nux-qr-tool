export declare function decorateQR(
  qrPng: Buffer,
  artist: string,
  song: string,
  deviceId: string,
  deviceName: string,
  options?: { appName?: string; appVersion?: string },
): Promise<Buffer>
