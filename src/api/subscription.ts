import { api } from '@/api/axios';
import type { Tier } from '@/types/domain';

export type SubscriptionStatus =
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'trialing';

export interface SubscriptionInfo {
  tier: Tier;
  interval: string;
  amount: number;
  currency: string;
  subscription_status: SubscriptionStatus;
  current_period_end: number;
  cancel_at_period_end: boolean;
  subscription_id: string;
}

export interface SubscriptionResponse {
  subscription: SubscriptionInfo | null;
  tier: Tier;
}

export interface PortalResponse {
  portal_url: string;
  return_url: string;
}

export async function getSubscription(): Promise<SubscriptionResponse> {
  const { data } = await api.get<SubscriptionResponse>('/subscription');
  return data;
}

export async function getCustomerPortalUrl(): Promise<PortalResponse> {
  const { data } = await api.post<PortalResponse>('/customer-portal');
  return data;
}
