import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDivisibleBy,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class ProductFilterQueryDto {
  @Type(() => Number)
  @IsPositive()
  @IsInt()
  page: number = 1;

  @Type(() => Number)
  @Max(100)
  @IsDivisibleBy(5)
  @IsPositive()
  @IsInt()
  pageSize: number = 5;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Search by full or partial product name' })
  name?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  brand?: string;

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
}
