export type ProviderCategory = 
  | 'otp'
  | 'email'
  | 'maps'
  | 'notifications'
  | 'storage'
  | 'payment'
  | 'sms';

export interface NirmanAPIResponse<T = any> {
  success?: boolean;
  error?: string;
  data?: T;
}

export interface OTPVerifyRequest {
  phone: string;
  code: string;
}

export interface OTPVerifyResponse {
  verified: boolean;
  error?: string;
}
