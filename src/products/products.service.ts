import { Injectable, Logger } from '@nestjs/common';
import { ContentfulService } from '../integrations/contentful/contentful.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private readonly contentfulService: ContentfulService,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

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
