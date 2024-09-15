import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ContentfulService } from '../../integrations/contentful/contentful.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from '../entities/product.entity';
import { FindOptionsWhere, ILike, IsNull, Not, Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { ProductFilterQueryDto } from '../dtos/product-filter-query.dto';
import { plainToInstance } from 'class-transformer';
import { ProductPaginatedResultDto } from '../dtos/product-paginated-result.dto';

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
    if (minPrice) {
      where.price = MoreThanOrEqual(minPrice);
    }
    if (maxPrice) {
      where.price = LessThanOrEqual(maxPrice);
    }

    const [products, total] = await this.productRepository.findAndCount({
      where,
      take: pageSize,
      skip: pageSize * (page - 1),
    });

    return plainToInstance(ProductPaginatedResultDto, { total, page, pageSize, data: products });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async syncDataFromContentful() {
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
