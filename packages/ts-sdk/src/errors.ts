/** Error thrown for any non-2xx API response, with the parsed detail. */
export class AletheiaApiError extends Error {
  readonly status: number;
  readonly detail: unknown;

  constructor(status: number, detail: unknown) {
    super(AletheiaApiError.format(detail, status));
    this.name = 'AletheiaApiError';
    this.status = status;
    this.detail = detail;
  }

  static format(detail: unknown, status: number): string {
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      const parts = detail
        .map((d) => (d && typeof d === 'object' && 'msg' in d ? (d as { msg: string }).msg : null))
        .filter(Boolean);
      if (parts.length) return parts.join('; ');
    }
    if (detail && typeof detail === 'object' && 'detail' in detail) {
      return AletheiaApiError.format((detail as { detail: unknown }).detail, status);
    }
    return `Request failed with status ${status}`;
  }
}

/** Thrown when an authenticated call is made before login(). */
export class NotAuthenticatedError extends Error {
  constructor() {
    super('Not authenticated — call client.auth.login(wallet) first.');
    this.name = 'NotAuthenticatedError';
  }
}
