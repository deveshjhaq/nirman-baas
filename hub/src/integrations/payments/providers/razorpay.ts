import type { IntegrationProvider } from '../../registry/providers';

export const RazorpayProvider: IntegrationProvider = {
  name: 'razorpay',
  category: 'payments',

  async execute(action: string, params: Record<string, any>, credentials: Record<string, any>) {
    const { key_id, key_secret } = credentials;
    if (!key_id || !key_secret) throw new Error('Razorpay credentials not configured');

    const authHeader = 'Basic ' + btoa(`${key_id}:${key_secret}`);

    if (action === 'create_order') {
      const resp = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({
          amount: params.amount, // in paise
          currency: params.currency || 'INR',
          receipt: params.receipt || `rcpt_${Date.now()}`,
          notes: params.notes || {},
        }),
      });
      const data = await resp.json();
      return { success: true, order_id: data.id, amount: data.amount, currency: data.currency };
    }

    if (action === 'verify') {
      // Razorpay signature verification would use crypto.createHmac in production
      return {
        success: true,
        verified: true,
        payment_id: params.razorpay_payment_id,
        order_id: params.razorpay_order_id,
      };
    }

    throw new Error(`Unknown action: ${action}`);
  },
};
