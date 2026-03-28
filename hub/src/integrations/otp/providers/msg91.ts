import { OtpProvider } from '../interface.ts';

export default class MSG91Provider implements OtpProvider {
  private authKey: string;
  private templateId: string;

  constructor(credentials: any, config: any) {
    this.authKey = credentials.auth_key;
    this.templateId = config.template_id || credentials.template_id;

    if (!this.authKey || !this.templateId) {
      throw new Error("MSG91 credentials missing. Requires 'auth_key' and 'template_id'.");
    }
  }

  async sendOtp(phone: string, otpLength: number = 6): Promise<any> {
    // MSG91 expects mobile number without + sign generally, but can handle it in payload if formatted
    const cleanPhone = phone.replace('+', '');
    
    const response = await fetch(
      `https://control.msg91.com/api/v5/otp?template_id=${this.templateId}&mobile=${cleanPhone}&otp_length=${otpLength}`,
      {
        method: 'POST',
        headers: {
          'authkey': this.authKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({}) // Param passed in URL for MSG91 usually
      }
    );

    const data = await response.json();
    if (data.type === 'error') {
       throw new Error(`MSG91 Error: ${data.message}`);
    }

    return { success: true, provider: 'msg91', request_id: data.request_id };
  }

  async verifyOtp(phone: string, code: string): Promise<boolean> {
    const cleanPhone = phone.replace('+', '');
    
    const response = await fetch(
      `https://control.msg91.com/api/v5/otp/verify?mobile=${cleanPhone}&otp=${code}`,
      {
        method: 'GET',
        headers: {
          'authkey': this.authKey
        }
      }
    );

    const data = await response.json();
    if (data.type === 'error') {
       throw new Error(`MSG91 Error: ${data.message}`);
    }

    return data.type === 'success';
  }
}
