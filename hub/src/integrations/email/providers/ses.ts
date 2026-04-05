import { BaseProvider } from '@nirman/provider-sdk';
import type { ProviderResult, CredentialField, ProviderAction } from '@nirman/provider-sdk';

export default class SESProvider extends BaseProvider {
  readonly name = 'ses';
  readonly category = 'email' as const;
  readonly version = '1.0.0';

  readonly credentialSchema: CredentialField[] = [
    {
      key: 'access_key',
      label: 'AWS Access Key ID',
      type: 'string',
      required: true,
      placeholder: 'AKIA...',
    },
    {
      key: 'secret_key',
      label: 'AWS Secret Access Key',
      type: 'secret',
      required: true,
      placeholder: 'wJalr...',
    },
    {
      key: 'region',
      label: 'AWS Region',
      type: 'select',
      required: false,
      default: 'us-east-1',
      options: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-south-1'],
    },
    {
      key: 'from_email',
      label: 'Verified Sender Email',
      type: 'string',
      required: true,
      placeholder: 'noreply@yourdomain.com',
    },
  ];

  readonly actions: ProviderAction[] = [
    {
      name: 'send',
      description: 'Send an email via AWS SES',
      params: {
        to:       { type: 'string', required: true,  description: 'Recipient email address' },
        subject:  { type: 'string', required: true,  description: 'Email subject line' },
        body:     { type: 'string', required: true,  description: 'Email body (HTML or plain text)' },
        isHtml:   { type: 'boolean', required: false, description: 'Set true for HTML body', default: false },
      },
    },
  ];

  protected async handle(
    action: string,
    params: Record<string, unknown>,
    credentials: Record<string, unknown>
  ): Promise<ProviderResult> {
    const region = (credentials['region'] as string) || 'us-east-1';

    if (action === 'send') {
      /**
       * Production implementation should use AWS Signature V4 signing.
       * For a full BaaS, use @aws-sdk/client-ses:
       *
       *   import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
       *   const client = new SESClient({ region, credentials: { accessKeyId, secretAccessKey } });
       *   await client.send(new SendEmailCommand({ ... }));
       *
       * Stubbed here for interface-correctness; replace with SDK call in production.
       */
      return {
        success: true,
        provider: this.name,
        action,
        data: {
          messageId: `ses-${Date.now()}-stub`,
          to: params.to,
          subject: params.subject,
          region,
        },
        meta: {
          note: 'Production: use @aws-sdk/client-ses with Signature V4 signing',
        },
      };
    }

    throw new Error(`Unsupported action: ${action}`);
  }
}
