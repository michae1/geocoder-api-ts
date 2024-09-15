import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import { FeatureCollection, GeoJSON, Geometry } from 'geojson';
import { PopulatedZone } from './app.interfaces';

@Injectable()
export class DataService {
  private readonly dataFilePath: string;
  data: FeatureCollection<Geometry, PopulatedZone>;

  constructor(private configService: ConfigService) {
    this.dataFilePath = this.configService.get<string>('POPULATED_AREAS_FILE_PATH');
  }

  getData() {
    return this.data;
  }

  async loadData(): Promise<FeatureCollection<Geometry, PopulatedZone>> {
    try {
      const fileData = await fs.readFile(this.dataFilePath, 'utf8');
      this.data = JSON.parse(fileData) as FeatureCollection<Geometry, PopulatedZone>;
      return this.data;
    } catch (error) {
      throw new Error(`Error loading data: ${error.message}`);
    }
  }
}
