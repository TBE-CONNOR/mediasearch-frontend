import { isAxiosError } from 'axios';
import type { AxiosError } from 'axios';

export function is429(error: unknown): error is AxiosError {
  return isAxiosError(error) && error.response?.status === 429;
}
