import type { IntegrationProvider } from '../../registry/providers';

export const OneSignalProvider: IntegrationProvider = {
  name: 'onesignal',
  category: 'notifications',

  async execute(action: string, params: Record<string, any>, credentials: Record<string, any>) {
    const { app_id, rest_api_key } = credentials;
    if (!app_id || !rest_api_key) throw new Error('OneSignal credentials not configured');

    if (action === 'send') {
      const resp = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${rest_api_key}`,
        },
        body: JSON.stringify({
          app_id,
          include_player_ids: params.player_ids || [],
          include_external_user_ids: params.external_user_ids || [],
          headings: { en: params.title || 'Notification' },
          contents: { en: params.body || '' },
          data: params.data || {},
        }),
      });

      const data = await resp.json();
      return { success: !data.errors, id: data.id, recipients: data.recipients };
    }

    throw new Error(`Unknown action: ${action}`);
  },
};
