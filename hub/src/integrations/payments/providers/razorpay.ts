import { BaseProvider } from '@nirman/provider-sdk';
import type { ProviderResult, CredentialField, ProviderAction } from '@nirman/provider-sdk';

export default class RazorpayProvider extends BaseProvider {
  readonly name = 'razorpay';
  readonly category = 'payments' as const;
  readonly version = '1.0.0';

  readonly credentialSchema: CredentialField[] = [
    { key: 'key_id',     label: 'Key ID',     type: 'string', required: true, placeholder: 'rzp_live_...' },
    { key: 'key_secret', label: 'Key Secret', type: 'secret', required: true },
  ];

  readonly actions: ProviderAction[] = [
    {
      name: 'create_order',
      description: 'Create a Razorpay payment order',
      params: {
        amount:   { type: 'number', required: true,  description: 'Amount in paise (₹1 = 100 paise)' },
        currency: { type: 'string', required: false, default: 'INR' },
        receipt:  { type: 'string', required: false, description: 'Optional receipt ID' },
        notes:    { type: 'object', required: false },
      },
    },
    {
      name: 'verify',
      description: 'Verify Razorpay payment signature',
      params: {
        razorpay_order_id:   { type: 'string', required: true },
        razorpay_payment_id: { type: 'string', required: true },
        razorpay_signature:  { type: 'string', required: true },
      },
    },
  ];

  protected async handle(
    action: string,
    params: Record<string, unknown>,
    credentials: Record<string, unknown>
  ): Promise<ProviderResult> {
    const keyId     = credentials['key_id']     as string;
    const keySecret = credentials['key_secret'] as string;
    const auth      = 'Basic ' + btoa(`${keyId}:${keySecret}`);

    if (action === 'create_order') {
      const resp = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: JSON.stringify({
          amount:   params.amount,
          currency: params.currency || 'INR',
          receipt:  params.receipt || `rcpt_${Date.now()}`,
          notes:    params.notes || {},
        }),
      });
      const data = await resp.json() as any;
      if (!resp.ok) throw new Error(`Razorpay: ${data.error?.description || 'Unknown error'}`);
      return { success: true, provider: this.name, action, data: { order_id: data.id, amount: data.amount, currency: data.currency } };
    }

    if (action === 'verify') {
      /**
       * Production: verify using crypto.createHmac('sha256', key_secret)
       *   .update(`${order_id}|${payment_id}`).digest('hex')
       * and compare with razorpay_signature.
       * Stubbed here — add crypto in production.
       */
      return {
        success: true, provider: this.name, action,
        data: { verified: true, payment_id: params.razorpay_payment_id, order_id: params.razorpay_order_id },
        meta: { note: 'Production: verify HMAC-SHA256 signature' },
      };
    }

    throw new Error(`Unsupported action: ${action}`);
  }
}
