import type { IntegrationProvider } from '../../registry/providers';

export const PayUProvider: IntegrationProvider = {
  name: 'payu',
  category: 'payments',

  async execute(action: string, params: Record<string, any>, credentials: Record<string, any>) {
    const { merchant_key, merchant_salt } = credentials;
    if (!merchant_key || !merchant_salt) throw new Error('PayU credentials not configured');

    if (action === 'create_order') {
      // PayU uses form-based redirect flow; this returns the params needed by frontend
      const txnid = params.txnid || `txn_${Date.now()}`;
      return {
        success: true,
        provider: 'payu',
        action_url: 'https://secure.payu.in/_payment',
        params: {
          key: merchant_key,
          txnid,
          amount: params.amount,
          productinfo: params.productinfo || 'Nirman Purchase',
          firstname: params.firstname,
          email: params.email,
          phone: params.phone,
          surl: params.success_url,
          furl: params.failure_url,
        },
      };
    }

    if (action === 'verify') {
      const resp = await fetch('https://info.payu.in/merchant/postservice.php?form=2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          key: merchant_key,
          command: 'verify_payment',
          var1: params.txnid,
          hash: params.hash,
        }),
      });
      const data = await resp.json();
      return { verified: data.status === 1, transaction_details: data.transaction_details };
    }

    throw new Error(`Unknown action: ${action}`);
  },
};
