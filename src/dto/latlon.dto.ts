import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class LatLonDto {
  @Transform(({ value }) => parseFloat(value), { toClassOnly: true })
  @IsNumber()
  lat: number;

  @Transform(({ value }) => parseFloat(value), { toClassOnly: true })
  @IsNumber()
  lon: number;
}
