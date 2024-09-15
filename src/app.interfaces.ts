export interface LatLon {
  lat: number;
  lon: number;
}

export enum PlaceType {
  village = 'village',
  hamlet = 'hamlet',
  town = 'town',
  city = 'city',
}

export interface PopulatedZone {
  name: string;
  admin_level: number | null;
  place: PlaceType;
  id: number;
}

export enum ResultType {
  nearest = 'nearest',
  contains = 'contains',
}

export interface SearchResponse {
  resultType: ResultType;
  name: string;
  type: PlaceType;
}
