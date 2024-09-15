import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { LatLon, SearchResponse } from './app.interfaces';
import { GeoJSON } from 'geojson';
import { ApiExtraModels, ApiOkResponse, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LatLonDto } from './dto/latlon.dto';
import { PlaceResultDto } from './dto/place-result.dto';
@ApiTags('geocoder')
@ApiQuery({
  name: 'lat',
  description: 'Latitude',
  required: true,
  type: Number,
})
@ApiQuery({
  name: 'lon',
  description: 'Longitude',
  required: true,
  type: Number,
})
@ApiResponse({
  description: 'Location found',
  type: PlaceResultDto,
})
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('reverse')
  reverseGeocode(@Query() coordinates: LatLonDto): SearchResponse {
    const result = this.appService.getReverseLocation(coordinates);
    if (!result) {
      throw new BadRequestException('Invalid user');
    }
    return result;
  }
}
