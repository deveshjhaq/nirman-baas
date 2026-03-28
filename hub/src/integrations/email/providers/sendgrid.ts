import { EmailProvider } from '../interface.ts';

export default class SendGridProvider implements EmailProvider {
  private apiKey: string;
  private fromEmail: string;

  constructor(credentials: any, config: any) {
    this.apiKey = credentials.api_key;
    this.fromEmail = config.from_email || credentials.from_email;

    if (!this.apiKey || !this.fromEmail) {
      throw new Error("SendGrid credentials missing. Requires 'api_key' and 'from_email'.");
    }
  }

  async sendEmail(to: string, subject: string, html: string, text?: string): Promise<any> {
    const payload = {
      personalizations: [
        {
          to: [{ email: to }],
          subject: subject
        }
      ],
      from: { email: this.fromEmail },
      content: [
        {
          type: 'text/plain',
          value: text || html.replace(/<[^>]*>?/gm, '')
        },
        {
          type: 'text/html',
          value: html
        }
      ]
    };

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SendGrid API Error: ${errorText}`);
    }

    return { success: true, provider: 'sendgrid' };
  }
}
