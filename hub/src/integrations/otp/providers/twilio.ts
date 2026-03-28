import { OtpProvider } from '../interface.ts';

export default class TwilioProvider implements OtpProvider {
  private accountSid: string;
  private authToken: string;
  private serviceSid: string;

  constructor(credentials: any, config: any) {
    this.accountSid = credentials.account_sid;
    this.authToken = credentials.auth_token;
    this.serviceSid = config.verify_service_sid || credentials.service_sid;

    if (!this.accountSid || !this.authToken) {
      throw new Error("Twilio credentials missing. Requires 'account_sid' and 'auth_token'.");
    }
  }

  async sendOtp(phone: string): Promise<any> {
    const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
    
    const params = new URLSearchParams();
    params.append('To', phone);
    params.append('Channel', 'sms');

    const response = await fetch(
      `https://verify.twilio.com/v2/Services/${this.serviceSid}/Verifications`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Twilio Verify Error: ${data.message || 'Unknown error'}`);
    }

    return { success: true, provider: 'twilio', status: data.status, sid: data.sid };
  }

  async verifyOtp(phone: string, code: string): Promise<boolean> {
    const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
    
    const params = new URLSearchParams();
    params.append('To', phone);
    params.append('Code', code);

    const response = await fetch(
      `https://verify.twilio.com/v2/Services/${this.serviceSid}/VerificationCheck`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Twilio Verify Error: ${data.message || 'Unknown error'}`);
    }

    return data.status === 'approved';
  }
}
