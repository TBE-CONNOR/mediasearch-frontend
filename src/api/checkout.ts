import { api } from '@/api/axios';
import type { Tier } from '@/types/domain';

export interface CreateCheckoutRequest {
  price_id: string;
  tier: Tier;
  success_url: string;
  cancel_url: string;
}

export interface CreateCheckoutResponse {
  checkout_url: string;
}

export async function createCheckoutSession(
  req: CreateCheckoutRequest,
): Promise<CreateCheckoutResponse> {
  const { data } = await api.post<CreateCheckoutResponse>('/checkout', req);
  return data;
}
