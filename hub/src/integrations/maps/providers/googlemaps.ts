import { MapsProvider } from '../interface.ts';

export default class GoogleMapsProvider implements MapsProvider {
  private apiKey: string;

  constructor(credentials: any, config: any) {
    this.apiKey = credentials.api_key;
    if (!this.apiKey) {
      throw new Error("Google Maps credentials missing. Requires 'api_key'.");
    }
  }

  async geocode(address: string): Promise<any> {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Google Maps Error: ${data.status} - ${data.error_message || ''}`);
    }

    return {
      success: true,
      provider: 'google_maps',
      results: data.results
    };
  }
}
