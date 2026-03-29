import type { IntegrationProvider } from '../../registry/providers';

export const StripeProvider: IntegrationProvider = {
  name: 'stripe',
  category: 'payments',

  async execute(action: string, params: Record<string, any>, credentials: Record<string, any>) {
    const secretKey = credentials['secret_key'];
    if (!secretKey) throw new Error('Stripe secret key not configured');

    if (action === 'create_order') {
      const resp = await fetch('https://api.stripe.com/v1/payment_intents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          amount: String(params.amount),
          currency: params.currency || 'usd',
          'automatic_payment_methods[enabled]': 'true',
        }),
      });
      const data = await resp.json();
      return {
        success: true,
        payment_intent_id: data.id,
        client_secret: data.client_secret,
        amount: data.amount,
        currency: data.currency,
      };
    }

    if (action === 'verify') {
      const resp = await fetch(`https://api.stripe.com/v1/payment_intents/${params.payment_intent_id}`, {
        headers: { 'Authorization': `Bearer ${secretKey}` },
      });
      const data = await resp.json();
      return { verified: data.status === 'succeeded', status: data.status };
    }

    throw new Error(`Unknown action: ${action}`);
  },
};
