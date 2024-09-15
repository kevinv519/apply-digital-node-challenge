import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductsService } from '../services/products.service';
import { ProductFilterQueryDto } from '../dtos/product-filter-query.dto';
import { ProductPaginatedResultDto } from '../dtos/product-paginated-result.dto';
import { IdUuidParamDto } from '../../core/dtos/id-uuid-param.dto';

@Controller('products')
@ApiTags('Products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  listProductsPage(@Query() filterQueryDto: ProductFilterQueryDto): Promise<ProductPaginatedResultDto> {
    return this.productsService.listProductsPage(filterQueryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeProductById(@Param() idParam: IdUuidParamDto) {
    return this.productsService.removeProductById(idParam.id);
  }
}
