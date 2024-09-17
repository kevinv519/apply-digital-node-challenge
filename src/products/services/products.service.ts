import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import {
  And,
  FindOperator,
  FindOptionsWhere,
  ILike,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { ContentfulService } from '../../integrations/contentful/services/contentful.service';
import { ProductFilterQueryDto } from '../dtos/product-filter-query.dto';
import { ProductPaginatedResultDto } from '../dtos/product-paginated-result.dto';
import { ProductEntity } from '../entities/product.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private readonly contentfulService: ContentfulService,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async listProductsPage(filterQueryDto: ProductFilterQueryDto) {
    const where: FindOptionsWhere<ProductEntity> = {};
    const { page, pageSize, minPrice, maxPrice, brand, category, name } = filterQueryDto;

    if (minPrice && maxPrice && minPrice > maxPrice) {
      throw new BadRequestException('maxPrice should be greater than minPrice');
    }

    if (name) {
      where.name = ILike(`%${name}%`);
    }
    if (brand) {
      where.brand = brand;
    }
    if (category) {
      where.category = category;
    }
    const pricesFilter: FindOperator<number>[] = [];
    if (minPrice) {
      pricesFilter.push(MoreThanOrEqual(minPrice));
    }
    if (maxPrice) {
      pricesFilter.push(LessThanOrEqual(maxPrice));
    }
    if (pricesFilter.length) {
      where.price = And(...pricesFilter);
    }

    const [products, total] = await this.productRepository.findAndCount({
      where,
      take: pageSize,
      skip: pageSize * (page - 1),
    });

    return plainToInstance(ProductPaginatedResultDto, { total, page, pageSize, data: products });
  }

  async removeProductById(id: string): Promise<void> {
    const foundProduct = await this.productRepository.findOneBy({ id });

    if (!foundProduct) {
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }

    await this.productRepository.softRemove(foundProduct);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async syncDataFromContentful(): Promise<void> {
    this.logger.log('Starting scheduled job to sync products from Contentful');

    const lastProduct = await this.productRepository.findOne({
      where: { id: Not(IsNull()) },
      order: { updatedAt: 'desc' },
    });

    const limit = 50;
    let page = 0;
    let shouldFetchMore = true;
    const products: ProductEntity[] = [];

    while (shouldFetchMore) {
      const response = await this.contentfulService.fetchProductsPage({
        limit,
        skip: page * limit,
        lastUpdateDate: lastProduct?.updatedAt,
      });

      products.push(
        ...response.items.map(
          (item): ProductEntity =>
            this.productRepository.create({
              contentfulId: item.sys.id,
              createdAt: item.sys.createdAt,
              updatedAt: item.sys.updatedAt,
              ...item.fields,
            }),
        ),
      );

      page++;

      shouldFetchMore = response.total > limit * page;
    }

    this.logger.log(`Found ${products.length} to update`);

    await this.productRepository.upsert(products, {
      skipUpdateIfNoValuesChanged: true,
      conflictPaths: { contentfulId: true },
    });

    this.logger.log('Completed scheduled job to sync products from Contentful');
  }
}
