import { Type } from 'class-transformer';
import { IsOptional, Min, IsNumber, IsDate } from 'class-validator';

export class NonDeletedFilterQueryDto {
  @Type(() => Number)
  @IsOptional()
  @Min(0)
  @IsNumber()
  minPrice?: number;

  @Type(() => Number)
  @IsOptional()
  @Min(0)
  @IsNumber()
  maxPrice?: number;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  endDate: Date;
}
