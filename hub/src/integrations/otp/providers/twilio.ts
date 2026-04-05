import { BaseProvider } from '@nirman/provider-sdk';
import type { ProviderResult, CredentialField, ProviderAction } from '@nirman/provider-sdk';

export default class TwilioProvider extends BaseProvider {
  readonly name = 'twilio';
  readonly category = 'otp' as const;
  readonly version = '1.0.0';

  readonly credentialSchema: CredentialField[] = [
    { key: 'account_sid',  label: 'Account SID',       type: 'string', required: true, placeholder: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
    { key: 'auth_token',   label: 'Auth Token',         type: 'secret', required: true },
    { key: 'service_sid',  label: 'Verify Service SID', type: 'string', required: true, placeholder: 'VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
  ];

  readonly actions: ProviderAction[] = [
    {
      name: 'send',
      description: 'Send an OTP via Twilio Verify',
      params: {
        phone:   { type: 'string', required: true, description: 'E.164 phone number, e.g. +919876543210' },
        channel: { type: 'string', required: false, description: "SMS or call", default: 'sms' },
      },
    },
    {
      name: 'verify',
      description: 'Verify an OTP code from Twilio Verify',
      params: {
        phone: { type: 'string', required: true },
        code:  { type: 'string', required: true },
      },
    },
  ];

  protected async handle(
    action: string,
    params: Record<string, unknown>,
    credentials: Record<string, unknown>
  ): Promise<ProviderResult> {
    const accountSid = credentials['account_sid'] as string;
    const authToken  = credentials['auth_token']  as string;
    const serviceSid = credentials['service_sid'] as string;
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    if (action === 'send') {
      const body = new URLSearchParams();
      body.append('To', params.phone as string);
      body.append('Channel', (params.channel as string) || 'sms');

      const resp = await fetch(
        `https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`,
        { method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body }
      );
      const data = await resp.json() as any;
      if (!resp.ok) throw new Error(`Twilio: ${data.message}`);

      return { success: true, provider: this.name, action, data: { status: data.status, sid: data.sid } };
    }

    if (action === 'verify') {
      const body = new URLSearchParams();
      body.append('To', params.phone as string);
      body.append('Code', params.code as string);

      const resp = await fetch(
        `https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`,
        { method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body }
      );
      const data = await resp.json() as any;
      if (!resp.ok) throw new Error(`Twilio: ${data.message}`);

      return { success: true, provider: this.name, action, data: { verified: data.status === 'approved', status: data.status } };
    }

    throw new Error(`Unsupported action: ${action}`);
  }
}
