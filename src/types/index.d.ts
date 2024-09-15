import RBush from 'geojson-rbush';
import { Geometry } from 'geojson';

declare module 'rbush-knn' {
  type Predicate = (node: Feature<Geometry>) => boolean;

  export default function knn(
    tree: RBush<Geometry>,
    x: number,
    y: number,
    n: number,
    predicate?: Predicate,
    maxDistance?: number
  ): TreeNode[];
}
