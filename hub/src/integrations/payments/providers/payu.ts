import { BaseProvider } from '@nirman/provider-sdk';
import type { ProviderResult, CredentialField, ProviderAction } from '@nirman/provider-sdk';

export default class PayUProvider extends BaseProvider {
  readonly name = 'payu';
  readonly category = 'payments' as const;
  readonly version = '1.0.0';

  readonly credentialSchema: CredentialField[] = [
    { key: 'merchant_key',  label: 'Merchant Key',  type: 'string', required: true },
    { key: 'merchant_salt', label: 'Merchant Salt', type: 'secret', required: true },
  ];

  readonly actions: ProviderAction[] = [
    {
      name: 'create_order',
      description: 'Generate PayU payment form params for frontend redirect',
      params: {
        amount:      { type: 'number', required: true },
        productinfo: { type: 'string', required: false, default: 'Nirman Purchase' },
        firstname:   { type: 'string', required: true },
        email:       { type: 'string', required: true },
        phone:       { type: 'string', required: true },
        success_url: { type: 'string', required: true },
        failure_url: { type: 'string', required: true },
        txnid:       { type: 'string', required: false, description: 'Custom transaction ID' },
      },
    },
    {
      name: 'verify',
      description: 'Verify a PayU payment by txnid',
      params: {
        txnid: { type: 'string', required: true },
        hash:  { type: 'string', required: true },
      },
    },
  ];

  protected async handle(
    action: string,
    params: Record<string, unknown>,
    credentials: Record<string, unknown>
  ): Promise<ProviderResult> {
    const merchantKey  = credentials['merchant_key']  as string;
    const merchantSalt = credentials['merchant_salt'] as string;

    if (action === 'create_order') {
      const txnid = (params.txnid as string) || `txn_${Date.now()}`;
      return {
        success: true, provider: this.name, action,
        data: {
          action_url: 'https://secure.payu.in/_payment',
          params: {
            key: merchantKey, txnid, amount: params.amount,
            productinfo: params.productinfo || 'Nirman Purchase',
            firstname: params.firstname, email: params.email, phone: params.phone,
            surl: params.success_url, furl: params.failure_url,
          },
        },
      };
    }

    if (action === 'verify') {
      const resp = await fetch('https://info.payu.in/merchant/postservice.php?form=2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ key: merchantKey, command: 'verify_payment', var1: params.txnid as string, hash: params.hash as string }),
      });
      const data = await resp.json() as any;
      return { success: data.status === 1, provider: this.name, action, data: { verified: data.status === 1, transaction_details: data.transaction_details } };
    }

    throw new Error(`Unsupported action: ${action}`);
  }
}
