import { BaseProvider } from '@nirman/provider-sdk';
import type { ProviderResult, CredentialField, ProviderAction } from '@nirman/provider-sdk';

export default class GoogleMapsProvider extends BaseProvider {
  readonly name = 'google_maps';
  readonly category = 'maps' as const;
  readonly version = '1.0.0';

  readonly credentialSchema: CredentialField[] = [
    { key: 'api_key', label: 'Google Maps API Key', type: 'secret', required: true },
  ];

  readonly actions: ProviderAction[] = [
    {
      name: 'geocode',
      description: 'Convert an address to lat/lng coordinates',
      params: {
        address: { type: 'string', required: true, description: 'Address string to geocode' },
      },
    },
    {
      name: 'reverse_geocode',
      description: 'Convert lat/lng to a human-readable address',
      params: {
        lat: { type: 'number', required: true },
        lng: { type: 'number', required: true },
      },
    },
    {
      name: 'directions',
      description: 'Get route directions between two places',
      params: {
        origin:      { type: 'string', required: true, description: 'Start address or place_id' },
        destination: { type: 'string', required: true, description: 'End address or place_id' },
        mode:        { type: 'string', required: false, default: 'driving', description: 'driving|walking|bicycling|transit' },
      },
    },
  ];

  protected async handle(
    action: string,
    params: Record<string, unknown>,
    credentials: Record<string, unknown>
  ): Promise<ProviderResult> {
    const key = credentials['api_key'] as string;

    if (action === 'geocode') {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(params.address as string)}&key=${key}`;
      const resp = await fetch(url);
      const data = await resp.json() as any;
      if (data.status !== 'OK') throw new Error(`Google Maps: ${data.status} — ${data.error_message || ''}`);
      const loc = data.results[0]?.geometry?.location;
      return { success: true, provider: this.name, action, data: { lat: loc?.lat, lng: loc?.lng, formatted_address: data.results[0]?.formatted_address, results: data.results } };
    }

    if (action === 'reverse_geocode') {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${params.lat},${params.lng}&key=${key}`;
      const resp = await fetch(url);
      const data = await resp.json() as any;
      if (data.status !== 'OK') throw new Error(`Google Maps: ${data.status}`);
      return { success: true, provider: this.name, action, data: { address: data.results[0]?.formatted_address } };
    }

    if (action === 'directions') {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(params.origin as string)}&destination=${encodeURIComponent(params.destination as string)}&mode=${params.mode || 'driving'}&key=${key}`;
      const resp = await fetch(url);
      const data = await resp.json() as any;
      if (data.status !== 'OK') throw new Error(`Google Maps Directions: ${data.status}`);
      return { success: true, provider: this.name, action, data: { routes: data.routes } };
    }

    throw new Error(`Unsupported action: ${action}`);
  }
}
