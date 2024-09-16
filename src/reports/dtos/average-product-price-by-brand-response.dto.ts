import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { roundToNthDecimalPlaces } from '../../core/utils';

@Exclude()
export class AverageProductPriceByBrandResponseDto {
  @Expose()
  brand: string;

  @Expose()
  @Transform(({ value }) => roundToNthDecimalPlaces(value, 2))
  @Type(() => Number)
  averagePrice: number;
}
