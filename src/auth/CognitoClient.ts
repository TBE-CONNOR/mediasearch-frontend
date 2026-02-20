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

export interface RefreshResult {
  idToken: string;
  expiresAt: number;
}

const userPool = new CognitoUserPool({
  UserPoolId: AWS_CONFIG.userPoolId,
  ClientId: AWS_CONFIG.userPoolClientId,
});

// Stored after signIn so refresh() can construct a CognitoUser without
// importing from the auth store (preserves import-order rule).
let currentEmail: string | null = null;

function toError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err));
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64)) as Record<string, unknown>;
}

const validTierSet = new Set<string>(VALID_TIERS);

function extractFromSession(session: CognitoUserSession) {
  const idToken = session.getIdToken().getJwtToken();
  const refreshToken = session.getRefreshToken().getToken();
  const expiresAt = session.getIdToken().getExpiration() * 1000;
  const payload = decodeJwtPayload(idToken);
  // Gotcha #6: for free users cognito:groups is ABSENT entirely
  const groups = payload['cognito:groups'] as string[] | undefined;
  const rawTier = groups?.[0] ?? 'free';
  const tier: Tier = validTierSet.has(rawTier) ? (rawTier as Tier) : 'free';
  const email = payload['email'] as string;
  const sub = payload['sub'] as string;
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

  refresh(refreshToken: string): Promise<RefreshResult> {
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
        const idToken = session.getIdToken().getJwtToken();
        const expiresAt = session.getIdToken().getExpiration() * 1000;
        resolve({ idToken, expiresAt });
      });
    });
  },

  /**
   * Like refresh() but returns full AuthResult including tier.
   * Use after Stripe checkout to pick up updated Cognito group membership.
   */
  refreshFull(refreshToken: string): Promise<AuthResult> {
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
   * Returns null if no cached session exists or the session is expired.
   */
  restoreSession(): Promise<AuthResult | null> {
    return new Promise((resolve) => {
      const user = userPool.getCurrentUser();
      if (!user) return resolve(null);

      user.getSession(
        (err: Error | null, session: CognitoUserSession | null) => {
          if (err || !session || !session.isValid()) return resolve(null);
          currentEmail = user.getUsername();
          resolve(extractFromSession(session));
        },
      );
    });
  },

  signOut() {
    currentEmail = null;
    const user = userPool.getCurrentUser();
    if (user) user.signOut();
  },
};
