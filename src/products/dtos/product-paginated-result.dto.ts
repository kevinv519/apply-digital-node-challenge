import { Exclude, Expose, Type } from 'class-transformer';
import { PaginatedResultDto } from '../../core/dtos/paginated-result.dto';

@Exclude()
export class ProductResponseDto {
  @Expose()
  id: string;

  @Expose()
  sku: string;

  @Expose()
  name: string;

  @Expose()
  brand: string;

  @Expose()
  model: string;

  @Expose()
  category: string;

  @Expose()
  color: string;

  @Expose()
  @Type(() => Number)
  price: number;

  @Expose()
  currency: string;

  @Expose()
  @Type(() => Number)
  stock: number;

  @Expose()
  @Type(() => Date)
  createdAt: number;

  @Expose()
  @Type(() => Date)
  updatedAt: number;
}

@Exclude()
export class ProductPaginatedResultDto extends PaginatedResultDto<ProductResponseDto> {
  @Type(() => ProductResponseDto)
  data: ProductResponseDto[] = [];
}
