export interface MapsProvider {
  geocode(address: string): Promise<any>;
}
