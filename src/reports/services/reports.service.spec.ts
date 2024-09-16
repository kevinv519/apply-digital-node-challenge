import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductEntity } from '../../products/entities/product.entity';
import { mockRepositoryFactory } from '../../core/testing/factories/mock.factory';
import { PartialMock } from '../../core/testing/types/partial-mock';
import { And, Between, IsNull, LessThanOrEqual, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { NonDeletedFilterQueryDto } from '../dtos/non-deleted-filter-query.dto';

describe('ReportsService', () => {
  let service: ReportsService;
  let productRepository: PartialMock<Repository<ProductEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: getRepositoryToken(ProductEntity),
          useFactory: mockRepositoryFactory,
        },
      ],
    }).compile();

    service = module.get(ReportsService);
    productRepository = module.get(getRepositoryToken(ProductEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deletedProductsPercentage', () => {
    it('should return percentage of deleted produts', async () => {
      const nonDeletedCount = 20;
      const deletedCount = 10;
      jest.spyOn(service as any, 'getDeletedAndNonDeletedProducts').mockResolvedValue({
        deletedCount,
        nonDeletedCount,
      });

      const result = await service.deletedProductsPercentage();

      expect(result).toEqual({
        percentage: service['getPercentage'](deletedCount / (deletedCount + nonDeletedCount)),
      });
    });

    it('should return 0 if there are no deleted products', async () => {
      jest.spyOn(service as any, 'getDeletedAndNonDeletedProducts').mockResolvedValue({
        deletedCount: 0,
        nonDeletedCount: 20,
      });

      const result = await service.deletedProductsPercentage();

      expect(result).toEqual({
        percentage: 0,
      });
    });
  });

  describe('nonDeletedProductsPercentage', () => {
    it('should return percentage of non-deleted products without filter', async () => {
      const nonDeletedCount = 20;
      const deletedCount = 10;
      jest.spyOn(service as any, 'getDeletedAndNonDeletedProducts').mockResolvedValue({
        deletedCount,
        nonDeletedCount,
      });

      const result = await service.nonDeletedProductsPercentage({
        startDate: new Date('2022-01-01'),
        endDate: new Date('2022-01-02'),
      });

      expect(result).toEqual({
        percentage: service['getPercentage'](nonDeletedCount / (deletedCount + nonDeletedCount)),
      });
    });

    it('should return 0 if there are no non-deleted products', async () => {
      jest.spyOn(service as any, 'getDeletedAndNonDeletedProducts').mockResolvedValue({
        deletedCount: 0,
        nonDeletedCount: 0,
      });

      const result = await service.nonDeletedProductsPercentage({
        startDate: new Date('2022-01-01'),
        endDate: new Date('2022-01-02'),
      });

      expect(result).toEqual({
        percentage: 0,
      });
    });
  });

  describe('listAverageProductPriceByBrand', () => {
    it('should return average product price by brand', async () => {
      const results = [
        { brand: 'brand1', averagePrice: 10 },
        { brand: 'brand2', averagePrice: 20 },
      ];

      productRepository.createQueryBuilder?.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(results),
      });

      const result = await service.listAverageProductPriceByBrand();

      expect(result).toEqual(results);
    });
  });

  describe('getDeletedAndNonDeletedProducts', () => {
    it('should throw BadRequestException if startDate is greater than endDate', async () => {
      expect.hasAssertions();
      const filterQueryDto: NonDeletedFilterQueryDto = {
        startDate: new Date('2022-01-02'),
        endDate: new Date('2022-01-01'),
      };

      try {
        await service['getDeletedAndNonDeletedProducts'](filterQueryDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('endDate should be greater than startDate');
      }
    });

    it('should throw BadRequestException if minPrice is greater than maxPrice', async () => {
      expect.hasAssertions();
      const filterQueryDto: NonDeletedFilterQueryDto = {
        startDate: new Date('2022-01-01'),
        endDate: new Date('2022-01-02'),
        minPrice: 100,
        maxPrice: 50,
      };

      try {
        await service['getDeletedAndNonDeletedProducts'](filterQueryDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('maxPrice should be greater than minPrice');
      }
    });

    it('should return deleted and non-deleted product counts', async () => {
      const filterQueryDto: NonDeletedFilterQueryDto = {
        startDate: new Date('2022-01-01'),
        endDate: new Date('2022-01-02'),
      };
      const deletedCount = 10;
      const nonDeletedCount = 20;

      productRepository.count?.mockResolvedValueOnce(deletedCount).mockResolvedValueOnce(nonDeletedCount);

      const result = await service['getDeletedAndNonDeletedProducts'](filterQueryDto);

      expect(result).toEqual({
        deletedCount,
        nonDeletedCount,
      });
    });

    it('should return deleted and non-deleted product counts with prices filter', async () => {
      const filterQueryDto: NonDeletedFilterQueryDto = {
        startDate: new Date('2022-01-01'),
        endDate: new Date('2022-01-02'),
        minPrice: 50,
        maxPrice: 100,
      };
      const deletedCount = 10;
      const nonDeletedCount = 20;

      productRepository.count?.mockResolvedValueOnce(deletedCount).mockResolvedValueOnce(nonDeletedCount);

      const result = await service['getDeletedAndNonDeletedProducts'](filterQueryDto);

      const commonWhere = {
        createdAt: Between(filterQueryDto.startDate, filterQueryDto.endDate),
        price: And(MoreThanOrEqual(filterQueryDto.minPrice), LessThanOrEqual(filterQueryDto.maxPrice)),
      };

      expect(result).toEqual({
        deletedCount,
        nonDeletedCount,
      });

      expect(productRepository.count).toHaveBeenCalledWith({
        withDeleted: true,
        where: {
          deletedAt: Not(IsNull()),
          ...commonWhere,
        },
      });
      expect(productRepository.count).toHaveBeenCalledWith({
        where: commonWhere,
      });
    });
  });
});
