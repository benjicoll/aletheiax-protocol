import { Http } from './http.js';
import type { AlethiaTier, MyAlethiaTier } from './types.js';

/** $ALETHIA holder utility — the tier ladder and your own tier. */
export class AlethiaModule {
  constructor(private readonly http: Http) {}

  /** Public tier ladder: what each holding threshold unlocks. */
  tiers(): Promise<{ enabled: boolean; mint: string | null; tiers: AlethiaTier[] }> {
    return this.http.get('/alethia/tiers');
  }

  /** The authenticated wallet's live balance, tier, and progress to the next tier. */
  myTier(): Promise<MyAlethiaTier> {
    return this.http.get<MyAlethiaTier>('/alethia/me');
  }
}
