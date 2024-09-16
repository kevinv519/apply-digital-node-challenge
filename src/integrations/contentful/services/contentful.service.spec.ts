import { HttpService } from '@nestjs/axios';
import { ConfigType } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { mockFactory } from '../../../core/testing/factories/mock.factory';
import contentfulConfig from '../config/contentful.config';
import { ContentfulService } from './contentful.service';
import { PartialMock } from '../../../core/testing/types/partial-mock';
import { of } from 'rxjs';

describe('ContentfulService', () => {
  let service: ContentfulService;
  let httpService: PartialMock<HttpService>;
  const config: Partial<ConfigType<typeof contentfulConfig>> = {
    accessToken: 'token',
    baseUrl: 'https://example.com',
    contentType: 'contentId',
    environment: 'environmentId',
    space: 'spaceId',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentfulService,
        { provide: HttpService, useValue: mockFactory(HttpService) },
        { provide: contentfulConfig.KEY, useValue: config },
      ],
    }).compile();

    service = module.get(ContentfulService);
    httpService = module.get(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(httpService).toBeDefined();
  });

  it('should call the contentful API with the right parameters', async () => {
    const url = `${config.baseUrl}/spaces/${config.space}/environments/${config.environment}/entries`;
    const params = { limit: 1, skip: 50, access_token: config.accessToken, content_type: config.contentType };
    httpService.get?.mockReturnValueOnce(of({}));

    await service.fetchProductsPage({ limit: 1, skip: 50 });

    expect(httpService.get).toHaveBeenCalledWith(url, { params });
  });

  it('should call the contentful API with the right parameters, including lastUpdatedDate', async () => {
    const url = `${config.baseUrl}/spaces/${config.space}/environments/${config.environment}/entries`;
    const lastUpdateDate = new Date();
    const params = {
      limit: 1,
      skip: 50,
      access_token: config.accessToken,
      content_type: config.contentType,
      'sys.updatedAt[gt]': lastUpdateDate.toISOString(),
    };
    httpService.get?.mockReturnValueOnce(of({}));

    await service.fetchProductsPage({ limit: 1, skip: 50, lastUpdateDate });

    expect(httpService.get).toHaveBeenCalledWith(url, { params });
  });
});
