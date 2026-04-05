import { BaseProvider } from '@nirman/provider-sdk';
import type { ProviderResult, CredentialField, ProviderAction } from '@nirman/provider-sdk';

export default class OneSignalProvider extends BaseProvider {
  readonly name = 'onesignal';
  readonly category = 'notifications' as const;
  readonly version = '1.0.0';

  readonly credentialSchema: CredentialField[] = [
    { key: 'app_id',      label: 'OneSignal App ID',   type: 'string', required: true },
    { key: 'rest_api_key',label: 'REST API Key',        type: 'secret', required: true },
  ];

  readonly actions: ProviderAction[] = [
    {
      name: 'send',
      description: 'Send push notification via OneSignal',
      params: {
        player_ids:         { type: 'array',  required: false, description: 'List of player IDs' },
        external_user_ids:  { type: 'array',  required: false, description: 'External user IDs' },
        title:              { type: 'string', required: true },
        body:               { type: 'string', required: true },
        data:               { type: 'object', required: false, description: 'Custom data payload' },
      },
    },
  ];

  protected async handle(
    action: string,
    params: Record<string, unknown>,
    credentials: Record<string, unknown>
  ): Promise<ProviderResult> {
    const appId      = credentials['app_id']       as string;
    const restApiKey = credentials['rest_api_key'] as string;

    if (action === 'send') {
      const resp = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Basic ${restApiKey}` },
        body: JSON.stringify({
          app_id,
          include_player_ids:        params.player_ids || [],
          include_external_user_ids: params.external_user_ids || [],
          headings:  { en: params.title || 'Notification' },
          contents:  { en: params.body  || '' },
          data:      params.data || {},
        }),
      });

      const data = await resp.json() as any;
      if (data.errors?.length) throw new Error(`OneSignal: ${JSON.stringify(data.errors)}`);

      return { success: true, provider: this.name, action, data: { id: data.id, recipients: data.recipients } };
    }

    throw new Error(`Unsupported action: ${action}`);
  }
}
