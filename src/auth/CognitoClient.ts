import {
  CognitoUserPool,
  CognitoUser,
  CognitoUserAttribute,
  AuthenticationDetails,
  CognitoRefreshToken,
} from 'amazon-cognito-identity-js';
import type { CognitoUserSession } from 'amazon-cognito-identity-js';
import { AWS_CONFIG } from '@/config/aws';
import { VALID_TIERS } from '@/types/domain';
import type { Tier } from '@/types/domain';

export interface AuthResult {
  idToken: string;
  refreshToken: string;
  expiresAt: number;
  email: string;
  sub: string;
  tier: Tier;
}

const userPool = new CognitoUserPool({
  UserPoolId: AWS_CONFIG.userPoolId,
  ClientId: AWS_CONFIG.userPoolClientId,
});

// Stored after signIn so refresh() can construct a CognitoUser without
// importing from the auth store (preserves import-order rule).
let currentEmail: string | null = null;

// localStorage key for persisting OAuth sessions across page reloads
const OAUTH_SESSION_KEY = 'mediasearch_oauth_session';

function toError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err));
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const base64Url = token.split('.')[1];
  if (!base64Url) {
    throw new Error('Invalid JWT: missing payload segment');
  }
  try {
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>;
  } catch {
    throw new Error('Invalid JWT: payload is not valid JSON');
  }
}

const validTierSet = new Set<string>(VALID_TIERS);

function extractTierFromPayload(payload: Record<string, unknown>): Tier {
  // Gotcha #6: for free users cognito:groups is ABSENT entirely
  const groups = payload['cognito:groups'] as string[] | undefined;
  const rawTier = groups?.[0] ?? 'free';
  return validTierSet.has(rawTier) ? (rawTier as Tier) : 'free';
}

function extractFromSession(session: CognitoUserSession) {
  const idToken = session.getIdToken().getJwtToken();
  const refreshToken = session.getRefreshToken().getToken();
  const expiresAt = session.getIdToken().getExpiration() * 1000;
  const payload = decodeJwtPayload(idToken);
  const tier = extractTierFromPayload(payload);
  const email = payload['email'];
  const sub = payload['sub'];
  if (typeof email !== 'string' || typeof sub !== 'string') {
    throw new Error('JWT missing required claims: email, sub');
  }
  return { idToken, refreshToken, expiresAt, email, sub, tier };
}

function extractFromTokens(
  idToken: string,
  refreshToken: string,
  expiresIn: number,
): AuthResult {
  const expiresAt = Date.now() + expiresIn * 1000;
  const payload = decodeJwtPayload(idToken);
  const tier = extractTierFromPayload(payload);
  const email = payload['email'];
  const sub = payload['sub'];
  if (typeof email !== 'string' || typeof sub !== 'string') {
    throw new Error('JWT missing required claims: email, sub');
  }
  return { idToken, refreshToken, expiresAt, email, sub, tier };
}

export const cognitoClient = {
  signUp(email: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const attrs = [
        new CognitoUserAttribute({ Name: 'email', Value: email }),
      ];
      userPool.signUp(email, password, attrs, [], (err) => {
        if (err) return reject(toError(err));
        resolve();
      });
    });
  },

  resendConfirmationCode(email: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const user = new CognitoUser({ Username: email, Pool: userPool });
      user.resendConfirmationCode((err) => {
        if (err) return reject(toError(err));
        resolve();
      });
    });
  },

  confirmSignUp(email: string, code: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const user = new CognitoUser({ Username: email, Pool: userPool });
      user.confirmRegistration(code, true, (err) => {
        if (err) return reject(toError(err));
        resolve();
      });
    });
  },

  signIn(email: string, password: string): Promise<AuthResult> {
    return new Promise((resolve, reject) => {
      const user = new CognitoUser({ Username: email, Pool: userPool });
      user.setAuthenticationFlowType('USER_PASSWORD_AUTH');
      const authDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });
      user.authenticateUser(authDetails, {
        onSuccess: (session) => {
          currentEmail = email;
          resolve(extractFromSession(session));
        },
        onFailure: (err: unknown) => reject(toError(err)),
      });
    });
  },

  /**
   * Exchange an OAuth authorization code for tokens.
   * Used after Google Sign-In redirects back with ?code=xxx.
   */
  async exchangeOAuthCode(code: string): Promise<AuthResult> {
    const redirectUri = `${AWS_CONFIG.appUrl}/auth/callback`;
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: AWS_CONFIG.userPoolClientId,
      code,
      redirect_uri: redirectUri,
    });

    const res = await fetch(`${AWS_CONFIG.cognitoDomain}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Token exchange failed: ${text}`);
    }

    const data = (await res.json()) as {
      id_token: string;
      refresh_token: string;
      expires_in: number;
    };

    const result = extractFromTokens(
      data.id_token,
      data.refresh_token,
      data.expires_in,
    );

    // Persist for session restore — Cognito SDK doesn't know about OAuth sessions
    currentEmail = result.email;
    localStorage.setItem(
      OAUTH_SESSION_KEY,
      JSON.stringify({ email: result.email, refreshToken: result.refreshToken }),
    );

    return result;
  },

  refresh(refreshToken: string): Promise<AuthResult> {
    return new Promise((resolve, reject) => {
      const email = currentEmail ?? userPool.getCurrentUser()?.getUsername();
      if (!email) {
        return reject(new Error('No active session'));
      }
      const user = new CognitoUser({ Username: email, Pool: userPool });
      const token = new CognitoRefreshToken({ RefreshToken: refreshToken });
      user.refreshSession(token, (err: unknown, session: CognitoUserSession) => {
        if (err) return reject(toError(err));
        currentEmail = email;
        resolve(extractFromSession(session));
      });
    });
  },

  /**
   * Restore session from Cognito SDK's internal localStorage on app startup.
   * Falls back to stored OAuth session data if the SDK has no session.
   * Returns null if no cached session exists or the session is expired.
   */
  restoreSession(): Promise<AuthResult | null> {
    return new Promise((resolve) => {
      const user = userPool.getCurrentUser();
      if (user) {
        user.getSession(
          (err: Error | null, session: CognitoUserSession | null) => {
            if (err || !session || !session.isValid()) {
              // SDK session invalid — try OAuth fallback
              resolve(this.restoreOAuthSession());
              return;
            }
            currentEmail = user.getUsername();
            resolve(extractFromSession(session));
          },
        );
        return;
      }

      // No SDK session — try OAuth fallback
      resolve(this.restoreOAuthSession());
    });
  },

  /**
   * Check localStorage for a stored OAuth session.
   * Returns a stale AuthResult (expiresAt: 0) so AuthBootstrap's refresh
   * logic kicks in and fetches fresh tokens via the refresh token.
   */
  restoreOAuthSession(): AuthResult | null {
    try {
      const raw = localStorage.getItem(OAUTH_SESSION_KEY);
      if (!raw) return null;
      const { email, refreshToken } = JSON.parse(raw) as {
        email: string;
        refreshToken: string;
      };
      if (!email || !refreshToken) return null;
      currentEmail = email;
      // Return stale result — AuthBootstrap will call refresh()
      return {
        idToken: '',
        refreshToken,
        expiresAt: 0,
        email,
        sub: '',
        tier: 'free',
      };
    } catch {
      localStorage.removeItem(OAUTH_SESSION_KEY);
      return null;
    }
  },

  /**
   * Returns the Cognito /logout URL if the current session is OAuth-based.
   * Must be called BEFORE signOut() clears the localStorage flag.
   */
  getOAuthLogoutUrl(): string | null {
    if (!localStorage.getItem(OAUTH_SESSION_KEY) || !AWS_CONFIG.cognitoDomain) {
      return null;
    }
    const params = new URLSearchParams({
      client_id: AWS_CONFIG.userPoolClientId,
      logout_uri: AWS_CONFIG.appUrl,
    });
    return `${AWS_CONFIG.cognitoDomain}/logout?${params.toString()}`;
  },

  signOut() {
    currentEmail = null;
    localStorage.removeItem(OAUTH_SESSION_KEY);
    const user = userPool.getCurrentUser();
    if (user) user.signOut();
  },
};
