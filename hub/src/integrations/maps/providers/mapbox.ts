import type { IntegrationProvider } from '../../registry/providers';

export const MapboxProvider: IntegrationProvider = {
  name: 'mapbox',
  category: 'maps',

  async execute(action: string, params: Record<string, any>, credentials: Record<string, any>) {
    const token = credentials['access_token'];
    if (!token) throw new Error('Mapbox access token not configured');

    if (action === 'geocode') {
      const query = encodeURIComponent(params.address);
      const resp = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${token}&limit=1`
      );
      const data = await resp.json();
      const feature = data.features?.[0];
      return {
        lat: feature?.center?.[1],
        lng: feature?.center?.[0],
        formatted_address: feature?.place_name,
      };
    }

    if (action === 'reverse_geocode') {
      const resp = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${params.lng},${params.lat}.json?access_token=${token}&limit=1`
      );
      const data = await resp.json();
      return { address: data.features?.[0]?.place_name };
    }

    throw new Error(`Unknown action: ${action}`);
  },
};
