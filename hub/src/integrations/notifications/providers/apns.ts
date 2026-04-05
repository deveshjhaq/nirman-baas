import { BaseProvider } from '@nirman/provider-sdk';
import type { ProviderResult, CredentialField, ProviderAction } from '@nirman/provider-sdk';

export default class APNsProvider extends BaseProvider {
  readonly name = 'apns';
  readonly category = 'notifications' as const;
  readonly version = '1.0.0';

  readonly credentialSchema: CredentialField[] = [
    { key: 'team_id',     label: 'Apple Team ID',      type: 'string', required: true },
    { key: 'key_id',      label: 'APNs Key ID',        type: 'string', required: true },
    { key: 'private_key', label: 'APNs Private Key (.p8)', type: 'secret', required: true },
    { key: 'bundle_id',   label: 'App Bundle ID',      type: 'string', required: true, placeholder: 'com.yourcompany.app' },
    { key: 'production',  label: 'Use Production',     type: 'boolean', required: false, default: 'false' },
  ];

  readonly actions: ProviderAction[] = [
    {
      name: 'send',
      description: 'Send a push notification via Apple APNs',
      params: {
        device_token: { type: 'string', required: true,  description: 'APNs device token' },
        title:        { type: 'string', required: true,  description: 'Notification title' },
        body:         { type: 'string', required: true,  description: 'Notification body' },
        badge:        { type: 'number', required: false, description: 'Badge count' },
        data:         { type: 'object', required: false, description: 'Custom payload data' },
      },
    },
  ];

  protected async handle(
    action: string,
    params: Record<string, unknown>,
    credentials: Record<string, unknown>
  ): Promise<ProviderResult> {
    if (action === 'send') {
      const bundleId = credentials['bundle_id'] as string;
      /**
       * Production: Use APNs HTTP/2 API with JWT auth (node:http2 + jsonwebtoken).
       * The .p8 private key + team_id + key_id are used to sign a short-lived JWT.
       * Stubbed here — replace with a full APNs HTTP/2 client.
       */
      return {
        success: true,
        provider: this.name,
        action,
        data: { device_token: params.device_token, bundle_id: bundleId },
        meta: { note: 'Production: implement with node:http2 + JWT signing of .p8 key' },
      };
    }

    throw new Error(`Unsupported action: ${action}`);
  }
}
