import { Feature, MultiPolygon, Point, Polygon } from 'geojson';
import { polygon } from '@turf/helpers';
import polygonToLine from '@turf/polygon-to-line';
import pointToLineDistance from '@turf/point-to-line-distance';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

/**
 * Returns distance in meters (negative values for points inside) from a point to the edges of a polygon
 * Copied from https://github.com/Turfjs/turf/issues/1743#issuecomment-736805738
 * Copied from https://github.com/kachkaev/tooling-for-how-old-is-this-house
 */
export const calculatePointDistanceToPolygonInMeters = (pt: Feature<Point>, pl: Feature<Polygon | MultiPolygon>) => {
  let distance: number;
  if (pl.geometry.type === 'MultiPolygon') {
    distance = pl.geometry.coordinates
      .map(coords => calculatePointDistanceToPolygonInMeters(pt, polygon(coords)))
      .reduce((smallest, current) => (current < smallest ? current : smallest));
  } else {
    if (pl.geometry.coordinates.length > 1) {
      // Has holes
      const [exteriorDistance, ...interiorDistances] = pl.geometry.coordinates.map(coords =>
        calculatePointDistanceToPolygonInMeters(pt, polygon([coords]))
      ) as [number, ...number[]];
      if (typeof exteriorDistance === 'number' && exteriorDistance < 0) {
        // point is inside the exterior polygon shape
        const smallestInteriorDistance = interiorDistances.reduce((smallest, current) =>
          current < smallest ? current : smallest
        );
        if (smallestInteriorDistance < 0) {
          // point is inside one of the holes (therefore not actually inside this shape)
          distance = smallestInteriorDistance * -1;
        } else {
          // find which is closer, the distance to the hole or the distance to the edge of the exterior, and set that as the inner distance.
          distance =
            smallestInteriorDistance < exteriorDistance * -1 ? smallestInteriorDistance * -1 : exteriorDistance;
        }
      } else {
        distance = exteriorDistance;
      }
    } else {
      const lineString = polygonToLine(pl);
      if (lineString.type !== 'Feature') {
        throw new Error(`Expected lineString.type to be Feature, got ${lineString.type}`);
      }

      const lineStringGeometry = lineString.geometry;
      if (lineStringGeometry.type !== 'LineString') {
        throw new Error(`Expected lineStringGeometry.type to be LineString, got  ${lineStringGeometry.type}`);
      }

      // The actual distance operation - on a normal, hole-less polygon (converted to meters)
      distance = pointToLineDistance(pt, lineStringGeometry) * 1000;
      if (booleanPointInPolygon(pt, pl)) {
        distance = distance * -1;
      }
    }
  }
  return distance;
};
