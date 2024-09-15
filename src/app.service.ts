import { Injectable } from '@nestjs/common';
import { LatLon, PlaceType, PopulatedZone, ResultType, SearchResponse } from './app.interfaces';
import { Feature, GeoJSON, Point } from 'geojson';
import { point } from '@turf/helpers';
import { SearchService } from './search.service';

@Injectable()
export class AppService {
  constructor(private searchService: SearchService) {}

  getReverseLocation(coordinates: LatLon): SearchResponse {
    const p = point([coordinates.lon, coordinates.lat]) as Feature<Point>;
    const coveredPopulatedZone = this.searchService.searchCovered(p);
    if (coveredPopulatedZone) {
      return {
        resultType: ResultType.contains,
        name: coveredPopulatedZone.properties.name,
        type: coveredPopulatedZone.properties.place,
      };
    }
    const nearest = this.searchService.searchNear(p);
    if (nearest) {
      return {
        resultType: ResultType.nearest,
        name: nearest.properties.name,
        type: nearest.properties.place,
      };
    }
  }
}
