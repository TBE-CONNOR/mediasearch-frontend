import { api } from '@/api/axios';

export interface DeleteAccountResponse {
  message: string;
  results: {
    dynamodb_records_deleted: number;
    s3_uploads_deleted: number;
    s3_kb_files_deleted: number;
    stripe_subscriptions_cancelled: number;
    cognito_user_deleted: boolean;
    kb_sync_triggered: boolean;
    errors?: string[];
  };
}

export async function deleteAccount(): Promise<DeleteAccountResponse> {
  const { data } = await api.post<DeleteAccountResponse>('/delete-account', {
    confirmation: 'DELETE',
  });
  return data;
}
