import { BaseProvider } from '@nirman/provider-sdk';
import type { ProviderResult, CredentialField, ProviderAction } from '@nirman/provider-sdk';

export default class ResendProvider extends BaseProvider {
  readonly name = 'resend';
  readonly category = 'email' as const;
  readonly version = '1.0.0';

  readonly credentialSchema: CredentialField[] = [
    { key: 'api_key',    label: 'API Key',    type: 'secret', required: true, placeholder: 're_xxxxxxx' },
    { key: 'from_email', label: 'From Email', type: 'string', required: true, placeholder: 'no-reply@example.com' },
  ];

  readonly actions: ProviderAction[] = [
    {
      name: 'send',
      description: 'Send an email via Resend API',
      params: {
        to:      { type: 'string', required: true,  description: 'Recipient email' },
        subject: { type: 'string', required: true,  description: 'Email subject' },
        html:    { type: 'string', required: true,  description: 'HTML email body' },
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

    if (action === 'send') {
      const html = params.html as string;
      const payload = {
        from: fromEmail,
        to: params.to,
        subject: params.subject,
        html,
        text: (params.text as string) || html.replace(/<[^>]*>?/gm, ''),
      };

      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await resp.json() as any;
      if (!resp.ok) throw new Error(`Resend: ${data.message || 'Unknown error'}`);

      return { success: true, provider: this.name, action, data: { id: data.id } };
    }

    throw new Error(`Unsupported action: ${action}`);
  }
}
