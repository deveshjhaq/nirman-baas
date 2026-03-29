import type { IntegrationProvider } from '../../registry/providers';

export const OlaProvider: IntegrationProvider = {
  name: 'ola',
  category: 'maps',

  async execute(action: string, params: Record<string, any>, credentials: Record<string, any>) {
    const apiKey = credentials['api_key'];
    if (!apiKey) throw new Error('OLA Maps API key not configured');

    if (action === 'geocode') {
      const query = encodeURIComponent(params.address);
      const resp = await fetch(
        `https://api.olamaps.io/places/v1/geocode?address=${query}&api_key=${apiKey}`
      );
      const data = await resp.json();
      const result = data.geocodingResults?.[0];
      return {
        lat: result?.geometry?.location?.lat,
        lng: result?.geometry?.location?.lng,
        formatted_address: result?.formatted_address,
      };
    }

    if (action === 'reverse_geocode') {
      const resp = await fetch(
        `https://api.olamaps.io/places/v1/reverse-geocode?latlng=${params.lat},${params.lng}&api_key=${apiKey}`
      );
      const data = await resp.json();
      return { address: data.results?.[0]?.formatted_address };
    }

    throw new Error(`Unknown action: ${action}`);
  },
};
