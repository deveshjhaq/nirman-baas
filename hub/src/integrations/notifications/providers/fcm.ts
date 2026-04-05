import { BaseProvider } from '@nirman/provider-sdk';
import type { ProviderResult, CredentialField, ProviderAction } from '@nirman/provider-sdk';

export default class FCMProvider extends BaseProvider {
  readonly name = 'fcm';
  readonly category = 'notifications' as const;
  readonly version = '1.0.0';

  readonly credentialSchema: CredentialField[] = [
    { key: 'server_key', label: 'FCM Server Key (Legacy) or Service Account JSON', type: 'secret', required: true },
    { key: 'project_id', label: 'Firebase Project ID', type: 'string', required: true },
  ];

  readonly actions: ProviderAction[] = [
    {
      name: 'send',
      description: 'Send a push notification via Firebase Cloud Messaging',
      params: {
        device_token: { type: 'string', required: true,  description: 'Target FCM device token' },
        title:        { type: 'string', required: true,  description: 'Notification title' },
        body:         { type: 'string', required: true,  description: 'Notification body' },
        data:         { type: 'object', required: false, description: 'Custom key-value data payload' },
      },
    },
  ];

  protected async handle(
    action: string,
    params: Record<string, unknown>,
    credentials: Record<string, unknown>
  ): Promise<ProviderResult> {
    const serverKey = credentials['server_key'] as string;

    if (action === 'send') {
      /**
       * Production: Use Firebase Admin SDK (HTTP v1 API with OAuth2 service account).
       * Legacy HTTP API used here for simplicity.
       */
      const payload = {
        to: params.device_token,
        notification: { title: params.title, body: params.body },
        data: (params.data as object) || {},
      };

      const resp = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: { Authorization: `key=${serverKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await resp.json() as any;
      if (!resp.ok || data.failure > 0) {
        throw new Error(`FCM: ${data.results?.[0]?.error || 'Unknown error'}`);
      }

      return { success: true, provider: this.name, action, data: { message_id: data.results?.[0]?.message_id } };
    }

    throw new Error(`Unsupported action: ${action}`);
  }
}
