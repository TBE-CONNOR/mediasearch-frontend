import { AWS_CONFIG } from '@/config/aws';

export function getGoogleAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: AWS_CONFIG.userPoolClientId,
    response_type: 'code',
    scope: 'openid email profile',
    identity_provider: 'Google',
    redirect_uri: `${AWS_CONFIG.appUrl}/auth/callback`,
  });
  return `${AWS_CONFIG.cognitoDomain}/oauth2/authorize?${params.toString()}`;
}
