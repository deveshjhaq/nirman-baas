import type { IntegrationProvider } from '../../registry/providers';

export const TwoFactorProvider: IntegrationProvider = {
  name: '2factor',
  category: 'otp',

  async execute(action: string, params: Record<string, any>, credentials: Record<string, any>) {
    const apiKey = credentials['api_key'];
    if (!apiKey) throw new Error('2Factor API key not configured');

    if (action === 'send') {
      const resp = await fetch(`https://2factor.in/API/V1/${apiKey}/SMS/${params.phone}/AUTOGEN`, {
        method: 'GET',
      });
      const data = await resp.json();
      return { success: data.Status === 'Success', session_id: data.Details };
    }

    if (action === 'verify') {
      const resp = await fetch(`https://2factor.in/API/V1/${apiKey}/SMS/VERIFY/${params.session_id}/${params.code}`, {
        method: 'GET',
      });
      const data = await resp.json();
      return { verified: data.Status === 'Success' };
    }

    throw new Error(`Unknown action: ${action}`);
  },
};
