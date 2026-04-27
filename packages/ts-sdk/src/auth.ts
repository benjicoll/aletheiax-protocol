import { Http } from './http.js';
import type { WalletSigner } from './types.js';

interface Challenge {
  message: string;
  nonce: string;
  timestamp: number;
}

interface VerifyResponse {
  token: string;
  wallet_address: string;
  is_new_user: boolean;
}

/**
 * Wallet-signature authentication.
 *
 * Flow: request a challenge, have the wallet sign it, exchange the signature
 * for a JWT. The token is stored on the shared Http instance and attached to
 * all subsequent authenticated calls.
 */
export class AuthModule {
  constructor(private readonly http: Http) {}

  async challenge(): Promise<Challenge> {
    return this.http.get<Challenge>('/auth/challenge');
  }

  /** Sign in with a wallet. Returns the authenticated wallet address. */
  async login(wallet: WalletSigner): Promise<string> {
    const challenge = await this.challenge();
    const signature = await wallet.signMessage(challenge.message);
    const res = await this.http.post<VerifyResponse>('/auth/verify', {
      wallet_address: wallet.publicKey,
      signature,
      nonce: challenge.nonce,
    });
    this.http.setToken(res.token);
    return res.wallet_address;
  }

  /** Attach a previously obtained JWT (e.g. restored from storage). */
  setToken(token: string): void {
    this.http.setToken(token);
  }

  logout(): void {
    this.http.setToken(null);
  }

  get isAuthenticated(): boolean {
    return this.http.getToken() !== null;
  }
}
