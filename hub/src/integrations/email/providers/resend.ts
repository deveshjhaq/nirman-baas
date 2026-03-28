import { EmailProvider } from '../interface.ts';

export default class ResendProvider implements EmailProvider {
  private apiKey: string;
  private fromEmail: string;

  constructor(credentials: any, config: any) {
    this.apiKey = credentials.api_key;
    this.fromEmail = config.from_email || credentials.from_email;

    if (!this.apiKey || !this.fromEmail) {
      throw new Error("Resend credentials missing. Requires 'api_key' and 'from_email'.");
    }
  }

  async sendEmail(to: string, subject: string, html: string, text?: string): Promise<any> {
    const payload = {
      from: this.fromEmail,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, '')
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Resend API Error: ${data.message || 'Unknown layout mapping error'}`);
    }

    return { success: true, provider: 'resend', id: data.id };
  }
}
