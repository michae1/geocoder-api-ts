import { ApiProperty } from '@nestjs/swagger';
import { PlaceType, ResultType, SearchResponse } from '../app.interfaces';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class PlaceResultDto implements SearchResponse {
  @ApiProperty()
  @IsString()
  @Expose()
  name: string;

  @ApiProperty({ enum: ResultType })
  resultType: ResultType;

  @ApiProperty({ enum: PlaceType })
  type: PlaceType;
}
