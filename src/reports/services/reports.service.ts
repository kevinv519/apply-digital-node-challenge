import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  And,
  Between,
  FindOperator,
  FindOptionsWhere,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { ProductEntity } from '../../products/entities/product.entity';
import { NonDeletedFilterQueryDto } from '../dtos/non-deleted-filter-query.dto';
import { plainToInstance } from 'class-transformer';
import { PercentageResponseDto } from '../dtos/percentage-response.dto';
import { AverageProductPriceByBrandResponseDto } from '../dtos/average-product-price-by-brand-response.dto';
import { roundToNthDecimalPlaces } from '../../core/utils';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async deletedProductsPercentage(): Promise<PercentageResponseDto> {
    const { deletedCount, nonDeletedCount } = await this.getDeletedAndNonDeletedProducts();

    if (deletedCount) {
      return plainToInstance(PercentageResponseDto, {
        percentage: this.getPercentage(deletedCount / (deletedCount + nonDeletedCount)),
      });
    }

    return plainToInstance(PercentageResponseDto, { percentage: 0 });
  }

  async nonDeletedProductsPercentage(filterQueryDto: NonDeletedFilterQueryDto): Promise<PercentageResponseDto> {
    const { deletedCount, nonDeletedCount } = await this.getDeletedAndNonDeletedProducts(filterQueryDto);

    if (!nonDeletedCount && !deletedCount) {
      return plainToInstance(PercentageResponseDto, { percentage: 0 });
    }

    return plainToInstance(PercentageResponseDto, {
      percentage: this.getPercentage(nonDeletedCount / (deletedCount + nonDeletedCount)),
    });
  }

  async listAverageProductPriceByBrand(): Promise<AverageProductPriceByBrandResponseDto[]> {
    const result = await this.productRepository
      .createQueryBuilder('products')
      .select('AVG(price)', 'averagePrice')
      .addSelect('brand')
      .groupBy('brand')
      .getRawMany<{ brand: string; averagePrice: number }>();

    return plainToInstance(AverageProductPriceByBrandResponseDto, result);
  }

  private async getDeletedAndNonDeletedProducts(filterQueryDto?: NonDeletedFilterQueryDto) {
    const where: FindOptionsWhere<ProductEntity> = {};

    if (filterQueryDto) {
      if (filterQueryDto.startDate > filterQueryDto.endDate) {
        throw new BadRequestException('endDate should be greater than startDate');
      }
      if (filterQueryDto.minPrice && filterQueryDto.maxPrice && filterQueryDto.minPrice > filterQueryDto.maxPrice) {
        throw new BadRequestException('maxPrice should be greater than minPrice');
      }

      where.createdAt = Between(filterQueryDto.startDate, filterQueryDto.endDate);

      const pricesFilter: FindOperator<number>[] = [];
      if (filterQueryDto.minPrice) {
        pricesFilter.push(MoreThanOrEqual(filterQueryDto.minPrice));
      }
      if (filterQueryDto.maxPrice) {
        pricesFilter.push(LessThanOrEqual(filterQueryDto.maxPrice));
      }

      if (pricesFilter.length) {
        where.price = And(...pricesFilter);
      }
    }

    const deletedCount = await this.productRepository.count({
      withDeleted: true,
      where: { deletedAt: Not(IsNull()), ...where },
    });
    const nonDeletedCount = await this.productRepository.count({ where });

    return { nonDeletedCount, deletedCount };
  }

  private getPercentage(value: number): number {
    return roundToNthDecimalPlaces(value * 100, 2);
  }
}
