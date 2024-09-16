import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class PercentageResponseDto {
  @Expose()
  @Type(() => Number)
  percentage: number;
}
