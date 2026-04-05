import { BaseProvider } from '@nirman/provider-sdk';
import type { ProviderResult, CredentialField, ProviderAction } from '@nirman/provider-sdk';

export default class OlaProvider extends BaseProvider {
  readonly name = 'ola';
  readonly category = 'maps' as const;
  readonly version = '1.0.0';

  readonly credentialSchema: CredentialField[] = [
    { key: 'api_key', label: 'Ola Maps API Key', type: 'secret', required: true },
  ];

  readonly actions: ProviderAction[] = [
    {
      name: 'geocode',
      description: 'Forward geocoding via Ola Maps',
      params: {
        address: { type: 'string', required: true },
      },
    },
    {
      name: 'reverse_geocode',
      description: 'Reverse geocoding via Ola Maps',
      params: {
        lat: { type: 'number', required: true },
        lng: { type: 'number', required: true },
      },
    },
  ];

  protected async handle(
    action: string,
    params: Record<string, unknown>,
    credentials: Record<string, unknown>
  ): Promise<ProviderResult> {
    const apiKey = credentials['api_key'] as string;

    if (action === 'geocode') {
      const query = encodeURIComponent(params.address as string);
      const resp = await fetch(`https://api.olamaps.io/places/v1/geocode?address=${query}&api_key=${apiKey}`);
      const data = await resp.json() as any;
      const result = data.geocodingResults?.[0];
      return {
        success: true, provider: this.name, action,
        data: { lat: result?.geometry?.location?.lat, lng: result?.geometry?.location?.lng, formatted_address: result?.formatted_address },
      };
    }

    if (action === 'reverse_geocode') {
      const resp = await fetch(`https://api.olamaps.io/places/v1/reverse-geocode?latlng=${params.lat},${params.lng}&api_key=${apiKey}`);
      const data = await resp.json() as any;
      return { success: true, provider: this.name, action, data: { address: data.results?.[0]?.formatted_address } };
    }

    throw new Error(`Unsupported action: ${action}`);
  }
}
