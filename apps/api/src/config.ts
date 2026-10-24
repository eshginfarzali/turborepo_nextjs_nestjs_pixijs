export const DEFAULT_PORT = 3001;
export const DEFAULT_CORS_ORIGIN = 'http://localhost:3000';

/** Comma-separated list of allowed browser origins, e.g. "http://localhost:3000". */
export function corsOrigins(
  value = process.env.CORS_ORIGIN ?? DEFAULT_CORS_ORIGIN,
): string[] {
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function port(value = process.env.PORT): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_PORT;
}
