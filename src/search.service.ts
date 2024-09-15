import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import RBush from 'geojson-rbush';
import knn from 'rbush-knn';
import { Feature, Geometry, MultiPolygon, Point, Polygon } from 'geojson';
import { DataService } from './data.service';
import { PopulatedZone } from './app.interfaces';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import distance from '@turf/distance';
import { calculatePointDistanceToPolygonInMeters } from './utils';

@Injectable()
export class SearchService implements OnModuleInit {
  tree = RBush<Geometry>();

  constructor(private dataService: DataService) {}

  async onModuleInit() {
    const data = await this.dataService.loadData();
    this.tree.load(data);
  }
  public searchCovered(p: Feature<Point>): Feature<Geometry, PopulatedZone> {
    const hereCollection = this.tree.search(p);
    let result: Feature<Geometry, PopulatedZone> | undefined = undefined;
    if (hereCollection.features.length) {
      const containedIn = hereCollection.features.find(f => {
        if (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon') {
          return booleanPointInPolygon(p, f as Feature<Polygon>);
        }
        return false;
      });
      if (containedIn) {
        result = containedIn as Feature<Geometry, PopulatedZone>;
      }
    }
    return result;
  }

  private getNearestFeature(p: Feature<Point>, neighbors: Feature<Geometry, PopulatedZone>[]) {
    let nearestFeature: Feature<Geometry, PopulatedZone> | null = null;
    let minDistance = Infinity;

    for (const neighbor of neighbors) {
      let d: number;

      if (neighbor.geometry.type === 'Point') {
        d = distance(p, neighbor as Feature<Point>);
      } else if (neighbor.geometry.type === 'Polygon' || neighbor.geometry.type === 'MultiPolygon') {
        d = calculatePointDistanceToPolygonInMeters(p, neighbor as Feature<Polygon | MultiPolygon>);
      } else {
        continue;
      }

      if (d < minDistance) {
        minDistance = d;
        nearestFeature = neighbor;
      }
    }
    return nearestFeature;
  }
  public searchNear(p: Feature<Point>): Feature<Geometry, PopulatedZone> {
    const lat = p.geometry.coordinates[0];
    const lon = p.geometry.coordinates[1];
    const neighbors: Feature<Geometry, PopulatedZone>[] = knn(this.tree, lon, lat, 3);
    return this.getNearestFeature(p, neighbors);
  }
}
