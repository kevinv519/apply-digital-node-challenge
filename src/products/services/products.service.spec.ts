import { faker } from '@faker-js/faker';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { And, ILike, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { mockFactory, mockRepositoryFactory } from '../../core/testing/factories/mock.factory';
import { PartialMock } from '../../core/testing/types/partial-mock';
import { ContentfulService } from '../../integrations/contentful/services/contentful.service';
import { ProductFilterQueryDto } from '../dtos/product-filter-query.dto';
import { ProductEntity } from '../entities/product.entity';
import { ProductsService } from './products.service';
import { ProductResponseDto } from '../dtos/product-paginated-result.dto';
import { ContentfulApiResponse } from '../../integrations/contentful/interfaces/contentful-api-response.interface';

const createProduct = (): ProductEntity => ({
  id: faker.string.uuid(),
  brand: faker.company.name(),
  category: faker.commerce.department(),
  color: faker.color.human(),
  contentfulId: faker.string.alphanumeric(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  currency: faker.finance.currencyCode(),
  model: faker.string.alphanumeric(),
  name: faker.commerce.productName(),
  price: faker.number.float({ min: 0.01 }),
  sku: faker.string.alphanumeric(),
  stock: faker.number.int({ min: 0 }),
});

describe('ProductsService', () => {
  let service: ProductsService;
  let contenfulService: PartialMock<ContentfulService>;
  let productRepository: PartialMock<Repository<ProductEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: ContentfulService, useValue: mockFactory(ContentfulService) },
        { provide: getRepositoryToken(ProductEntity), useFactory: mockRepositoryFactory<ProductEntity> },
      ],
    }).compile();

    service = module.get(ProductsService);
    contenfulService = module.get(ContentfulService);
    productRepository = module.get(getRepositoryToken(ProductEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(contenfulService).toBeDefined();
  });

  describe('removeProductById', () => {
    const id = 'uuid-id';
    it('should successfully remove product', async () => {
      productRepository.findOneBy?.mockReturnValueOnce({ id });

      await service.removeProductById(id);

      expect(productRepository.softRemove).toHaveBeenCalledWith({ id });
    });

    it('should throw when product not found', async () => {
      expect.hasAssertions();
      try {
        await service.removeProductById(id);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect((error as NotFoundException).message).toEqual(`Product with ID '${id}' not found`);
      }
    });
  });

  describe('listProductsPage', () => {
    it('should throw BadRequestException when minPrice is greater that maxPrice', async () => {
      expect.hasAssertions();

      try {
        await service.listProductsPage({ page: 1, pageSize: 5, minPrice: 100, maxPrice: 50 });
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect((error as BadRequestException).message).toEqual('maxPrice should be greater than minPrice');
      }
    });

    it('should apply all products filters and pagination information', async () => {
      const products: ProductEntity[] = Array.from({ length: 10 }, createProduct);
      const filter: ProductFilterQueryDto = {
        page: 1,
        pageSize: 10,
        brand: 'brand',
        category: 'category',
        maxPrice: 100,
        minPrice: 1,
        name: 'name',
      };

      productRepository.findAndCount?.mockReturnValueOnce([products, products.length]);

      const result = await service.listProductsPage(filter);

      expect(productRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          brand: filter.brand,
          category: filter.category,
          name: ILike(`%${filter.name}%`),
          price: And(MoreThanOrEqual(filter.minPrice), LessThanOrEqual(filter.maxPrice)),
        },
        take: filter.pageSize,
        skip: filter.pageSize * (filter.page - 1),
      });
      expect(result.data).toBeInstanceOf(Array<ProductResponseDto>);
      expect(result.data[0]).not.toHaveProperty('contentfulId');
      expect(result.data[0]).not.toHaveProperty('deletedAt');
    });
  });

  describe('syncDataFromContentful', () => {
    it('should fetch data from contentful', async () => {
      const items = Array.from({ length: 100 }, (): ContentfulApiResponse['items'][number] => ({
        sys: {
          id: faker.string.alphanumeric(),
          createdAt: faker.date.past().toISOString(),
          updatedAt: faker.date.recent().toISOString(),
          revision: 1,
        },
        fields: {
          brand: faker.company.name(),
          category: faker.commerce.department(),
          color: faker.color.human(),
          currency: faker.finance.currencyCode(),
          model: faker.string.alphanumeric(),
          name: faker.commerce.productName(),
          price: faker.number.float({ min: 0.01 }),
          sku: faker.string.alphanumeric(),
          stock: faker.number.int({ min: 0 }),
        },
      }));
      const limit = 50;

      contenfulService.fetchProductsPage?.mockReturnValueOnce({ total: items.length, items: items.slice(0, limit) });
      contenfulService.fetchProductsPage?.mockReturnValueOnce({ total: items.length, items: items.slice(limit) });

      await service.syncDataFromContentful();

      expect(contenfulService.fetchProductsPage).toHaveBeenCalledTimes(Math.ceil(items.length / limit));
      expect(productRepository.create).toHaveBeenCalledTimes(items.length);
      expect(productRepository.upsert).toHaveBeenCalledTimes(1);
    });
  });
});
