import type { OTPVerifyRequest, OTPVerifyResponse } from '@nirman/shared';

export class NirmanClient {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey: string, config?: { baseURL?: string }) {
    this.apiKey = apiKey;
    this.baseURL = config?.baseURL || 'https://api.nirman.dev/v1';

    if (!this.apiKey || !this.apiKey.startsWith('nk_')) {
      throw new Error("Invalid API Key format. Expected 'nk_...'");
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = new Headers(options.headers || {});
    headers.set('X-API-Key', this.apiKey);
    headers.set('Content-Type', 'application/json');

    const response = await fetch(url, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Nirman API Error: ${data.error || response.statusText}`);
    }

    return data as T;
  }

  get otp() {
    return {
      send: (phone: string, otpLength: number = 6) => 
        this.request<{ success: boolean; sid?: string; request_id?: string }>('/otp/send', {
          method: 'POST',
          body: JSON.stringify({ phone, otp_length: otpLength })
        }),
      
      verify: (req: OTPVerifyRequest) => 
        this.request<OTPVerifyResponse>('/otp/verify', {
          method: 'POST',
          body: JSON.stringify(req)
        })
    };
  }

  get email() {
    return {
      send: (to: string, subject: string, html: string, text?: string) => 
        this.request<{ success: boolean }>('/email/send', {
          method: 'POST',
          body: JSON.stringify({ to, subject, html, text })
        })
    };
  }

  // Define other domain getters (maps, storage, notifications) dynamically here.
}
