import { BaseProvider } from '@nirman/provider-sdk';
import type { ProviderResult, CredentialField, ProviderAction } from '@nirman/provider-sdk';

export default class MSG91Provider extends BaseProvider {
  readonly name = 'msg91';
  readonly category = 'otp' as const;
  readonly version = '1.0.0';

  readonly credentialSchema: CredentialField[] = [
    { key: 'auth_key',    label: 'Auth Key',    type: 'secret', required: true },
    { key: 'template_id', label: 'Template ID', type: 'string', required: true },
  ];

  readonly actions: ProviderAction[] = [
    {
      name: 'send',
      description: 'Send an OTP via MSG91',
      params: {
        phone:      { type: 'string', required: true, description: 'Mobile number with country code' },
        otp_length: { type: 'number', required: false, description: 'OTP digit length', default: 6 },
      },
    },
    {
      name: 'verify',
      description: 'Verify an OTP code from MSG91',
      params: {
        phone: { type: 'string', required: true },
        otp:   { type: 'string', required: true },
      },
    },
  ];

  protected async handle(
    action: string,
    params: Record<string, unknown>,
    credentials: Record<string, unknown>
  ): Promise<ProviderResult> {
    const authKey    = credentials['auth_key']    as string;
    const templateId = credentials['template_id'] as string;

    if (action === 'send') {
      const cleanPhone = (params.phone as string).replace('+', '');
      const otpLength  = (params.otp_length as number) || 6;

      const resp = await fetch(
        `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=${cleanPhone}&otp_length=${otpLength}`,
        { method: 'POST', headers: { authkey: authKey, 'Content-Type': 'application/json' }, body: '{}' }
      );
      const data = await resp.json() as any;
      if (data.type === 'error') throw new Error(`MSG91: ${data.message}`);

      return { success: true, provider: this.name, action, data: { request_id: data.request_id } };
    }

    if (action === 'verify') {
      const cleanPhone = (params.phone as string).replace('+', '');
      const resp = await fetch(
        `https://control.msg91.com/api/v5/otp/verify?mobile=${cleanPhone}&otp=${params.otp}`,
        { method: 'GET', headers: { authkey: authKey } }
      );
      const data = await resp.json() as any;
      if (data.type === 'error') throw new Error(`MSG91: ${data.message}`);

      return { success: true, provider: this.name, action, data: { verified: data.type === 'success' } };
    }

    throw new Error(`Unsupported action: ${action}`);
  }
}
