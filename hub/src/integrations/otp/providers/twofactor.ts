import { BaseProvider } from '@nirman/provider-sdk';
import type { ProviderResult, CredentialField, ProviderAction } from '@nirman/provider-sdk';

export default class TwoFactorProvider extends BaseProvider {
  readonly name = 'twofactor';
  readonly category = 'otp' as const;
  readonly version = '1.0.0';

  readonly credentialSchema: CredentialField[] = [
    { key: 'api_key', label: 'API Key', type: 'secret', required: true },
  ];

  readonly actions: ProviderAction[] = [
    {
      name: 'send',
      description: 'Send OTP via 2Factor India',
      params: {
        phone: { type: 'string', required: true, description: 'Mobile number with country code' },
      },
    },
    {
      name: 'verify',
      description: 'Verify OTP via 2Factor India',
      params: {
        session_id: { type: 'string', required: true, description: 'Session ID returned from send' },
        code:       { type: 'string', required: true, description: 'OTP entered by user' },
      },
    },
  ];

  protected async handle(
    action: string,
    params: Record<string, unknown>,
    credentials: Record<string, unknown>
  ): Promise<ProviderResult> {
    const apiKey = credentials['api_key'] as string;

    if (action === 'send') {
      const resp = await fetch(
        `https://2factor.in/API/V1/${apiKey}/SMS/${params.phone}/AUTOGEN`
      );
      const data = await resp.json() as any;
      if (data.Status !== 'Success') throw new Error(`2Factor: ${data.Details}`);

      return { success: true, provider: this.name, action, data: { session_id: data.Details } };
    }

    if (action === 'verify') {
      const resp = await fetch(
        `https://2factor.in/API/V1/${apiKey}/SMS/VERIFY/${params.session_id}/${params.code}`
      );
      const data = await resp.json() as any;

      return {
        success: data.Status === 'Success',
        provider: this.name,
        action,
        data: { verified: data.Status === 'Success', details: data.Details },
      };
    }

    throw new Error(`Unsupported action: ${action}`);
  }
}
