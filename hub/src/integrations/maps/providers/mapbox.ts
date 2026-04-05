import { BaseProvider } from '@nirman/provider-sdk';
import type { ProviderResult, CredentialField, ProviderAction } from '@nirman/provider-sdk';

export default class MapboxProvider extends BaseProvider {
  readonly name = 'mapbox';
  readonly category = 'maps' as const;
  readonly version = '1.0.0';

  readonly credentialSchema: CredentialField[] = [
    { key: 'access_token', label: 'Mapbox Access Token', type: 'secret', required: true, placeholder: 'pk.eyJ1...' },
  ];

  readonly actions: ProviderAction[] = [
    {
      name: 'geocode',
      description: 'Forward geocoding — address to coordinates',
      params: {
        address: { type: 'string', required: true },
      },
    },
    {
      name: 'reverse_geocode',
      description: 'Reverse geocoding — coordinates to address',
      params: {
        lat: { type: 'number', required: true },
        lng: { type: 'number', required: true },
      },
    },
    {
      name: 'directions',
      description: 'Get directions between two locations',
      params: {
        origin:      { type: 'string', required: true, description: 'Coordinates "lng,lat"' },
        destination: { type: 'string', required: true, description: 'Coordinates "lng,lat"' },
        profile:     { type: 'string', required: false, default: 'driving', description: 'driving|walking|cycling' },
      },
    },
  ];

  protected async handle(
    action: string,
    params: Record<string, unknown>,
    credentials: Record<string, unknown>
  ): Promise<ProviderResult> {
    const token = credentials['access_token'] as string;

    if (action === 'geocode') {
      const query = encodeURIComponent(params.address as string);
      const resp = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${token}&limit=1`);
      const data = await resp.json() as any;
      const feature = data.features?.[0];
      return { success: true, provider: this.name, action, data: { lat: feature?.center?.[1], lng: feature?.center?.[0], formatted_address: feature?.place_name } };
    }

    if (action === 'reverse_geocode') {
      const resp = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${params.lng},${params.lat}.json?access_token=${token}&limit=1`);
      const data = await resp.json() as any;
      return { success: true, provider: this.name, action, data: { address: data.features?.[0]?.place_name } };
    }

    if (action === 'directions') {
      const profile = (params.profile as string) || 'driving';
      const resp = await fetch(`https://api.mapbox.com/directions/v5/mapbox/${profile}/${params.origin};${params.destination}?access_token=${token}&geometries=geojson`);
      const data = await resp.json() as any;
      return { success: true, provider: this.name, action, data: { routes: data.routes } };
    }

    throw new Error(`Unsupported action: ${action}`);
  }
}
