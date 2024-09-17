import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { IdUuidParamDto } from '../../core/dtos/id-uuid-param.dto';
import { ProductFilterQueryDto } from '../dtos/product-filter-query.dto';
import { ProductPaginatedResultDto } from '../dtos/product-paginated-result.dto';
import { ProductsService } from '../services/products.service';

@Controller('products')
@ApiTags('Products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  listProductsPage(@Query() filterQueryDto: ProductFilterQueryDto): Promise<ProductPaginatedResultDto> {
    return this.productsService.listProductsPage(filterQueryDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeProductById(@Param() idParam: IdUuidParamDto) {
    return this.productsService.removeProductById(idParam.id);
  }
}
