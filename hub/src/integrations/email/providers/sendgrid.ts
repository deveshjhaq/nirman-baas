import { BaseProvider } from '@nirman/provider-sdk';
import type { ProviderResult, CredentialField, ProviderAction } from '@nirman/provider-sdk';

export default class SendGridProvider extends BaseProvider {
  readonly name = 'sendgrid';
  readonly category = 'email' as const;
  readonly version = '1.0.0';

  readonly credentialSchema: CredentialField[] = [
    { key: 'api_key',    label: 'API Key',     type: 'secret', required: true, placeholder: 'SG.xxxxxxx' },
    { key: 'from_email', label: 'From Email',  type: 'string', required: true, placeholder: 'no-reply@example.com' },
    { key: 'from_name',  label: 'From Name',   type: 'string', required: false, default: 'Nirman' },
  ];

  readonly actions: ProviderAction[] = [
    {
      name: 'send',
      description: 'Send a transactional email via SendGrid',
      params: {
        to:      { type: 'string', required: true,  description: 'Recipient email' },
        subject: { type: 'string', required: true,  description: 'Email subject' },
        html:    { type: 'string', required: true,  description: 'HTML body' },
        text:    { type: 'string', required: false, description: 'Plain-text fallback' },
      },
    },
  ];

  protected async handle(
    action: string,
    params: Record<string, unknown>,
    credentials: Record<string, unknown>
  ): Promise<ProviderResult> {
    const apiKey    = credentials['api_key']    as string;
    const fromEmail = credentials['from_email'] as string;
    const fromName  = (credentials['from_name'] as string) || 'Nirman';

    if (action === 'send') {
      const html = params.html as string;
      const payload = {
        personalizations: [{ to: [{ email: params.to }], subject: params.subject }],
        from: { email: fromEmail, name: fromName },
        content: [
          { type: 'text/plain', value: (params.text as string) || html.replace(/<[^>]*>?/gm, '') },
          { type: 'text/html',  value: html },
        ],
      };

      const resp = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`SendGrid: ${err}`);
      }

      return { success: true, provider: this.name, action, data: { to: params.to, subject: params.subject } };
    }

    throw new Error(`Unsupported action: ${action}`);
  }
}
