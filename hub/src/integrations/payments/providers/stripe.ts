import { BaseProvider } from '@nirman/provider-sdk';
import type { ProviderResult, CredentialField, ProviderAction } from '@nirman/provider-sdk';

export default class StripeProvider extends BaseProvider {
  readonly name = 'stripe';
  readonly category = 'payments' as const;
  readonly version = '1.0.0';

  readonly credentialSchema: CredentialField[] = [
    { key: 'secret_key',     label: 'Secret Key',      type: 'secret', required: true,  placeholder: 'sk_live_...' },
    { key: 'webhook_secret', label: 'Webhook Secret',  type: 'secret', required: false, placeholder: 'whsec_...' },
  ];

  readonly actions: ProviderAction[] = [
    {
      name: 'create_order',
      description: 'Create a Stripe PaymentIntent',
      params: {
        amount:   { type: 'number', required: true,  description: 'Amount in smallest currency unit (cents)' },
        currency: { type: 'string', required: false, default: 'usd' },
      },
    },
    {
      name: 'verify',
      description: 'Retrieve a PaymentIntent to verify its status',
      params: {
        payment_intent_id: { type: 'string', required: true },
      },
    },
  ];

  protected async handle(
    action: string,
    params: Record<string, unknown>,
    credentials: Record<string, unknown>
  ): Promise<ProviderResult> {
    const secretKey = credentials['secret_key'] as string;

    if (action === 'create_order') {
      const resp = await fetch('https://api.stripe.com/v1/payment_intents', {
        method: 'POST',
        headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          amount:   String(params.amount),
          currency: (params.currency as string) || 'usd',
          'automatic_payment_methods[enabled]': 'true',
        }),
      });
      const data = await resp.json() as any;
      if (!resp.ok) throw new Error(`Stripe: ${data.error?.message}`);
      return { success: true, provider: this.name, action, data: { payment_intent_id: data.id, client_secret: data.client_secret, amount: data.amount, currency: data.currency } };
    }

    if (action === 'verify') {
      const resp = await fetch(`https://api.stripe.com/v1/payment_intents/${params.payment_intent_id}`, {
        headers: { Authorization: `Bearer ${secretKey}` },
      });
      const data = await resp.json() as any;
      if (!resp.ok) throw new Error(`Stripe: ${data.error?.message}`);
      return { success: true, provider: this.name, action, data: { verified: data.status === 'succeeded', status: data.status } };
    }

    throw new Error(`Unsupported action: ${action}`);
  }
}
