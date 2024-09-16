import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from '../services/reports.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NonDeletedFilterQueryDto } from '../dtos/non-deleted-filter-query.dto';
import { PercentageResponseDto } from '../dtos/percentage-response.dto';
import { AverageProductPriceByBrandResponseDto } from '../dtos/average-product-price-by-brand-response.dto';

@Controller('reports')
@ApiTags('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('products/deleted')
  @ApiOperation({ summary: 'Returns the percentage of deleted products' })
  deletedProductsPercenage(): Promise<PercentageResponseDto> {
    return this.reportsService.deletedProductsPercentage();
  }

  @Get('products/non-deleted')
  @ApiOperation({
    summary:
      'Returns the percentage of non-deleted products given a `createdAt` date range. Optionally it can also be filtered by price range',
  })
  nonDeletedProductsPercenage(@Query() filterQueryDto: NonDeletedFilterQueryDto): Promise<PercentageResponseDto> {
    return this.reportsService.nonDeletedProductsPercentage(filterQueryDto);
  }

  @Get('products/average-price-by-brand')
  averageProductPriceByBrand(): Promise<AverageProductPriceByBrandResponseDto[]> {
    return this.reportsService.listAverageProductPriceByBrand();
  }
}
