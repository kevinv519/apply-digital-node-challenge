import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import contentfulConfig from './config/contentful.config';
import { ConfigType } from '@nestjs/config';
import { ContentfulApiResponse } from './interfaces/contentful-api-response.interface';
import { lastValueFrom } from 'rxjs';
import { FetchPageFilter } from './interfaces/fetch-page-filter.interface';

@Injectable()
export class ContentfulService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(contentfulConfig.KEY)
    private readonly config: ConfigType<typeof contentfulConfig>,
  ) {}

  async fetchProductsPage(filterParams: FetchPageFilter): Promise<ContentfulApiResponse> {
    const url = `${this.config.baseUrl}/spaces/${this.config.space}/environments/${this.config.environment}/entries`;
    const params = {
      limit: filterParams.limit,
      skip: filterParams.skip,
      access_token: this.config.accessToken,
      content_type: this.config.contentType,
    };

    if (filterParams.lastUpdateDate) {
      params['sys.updatedAt[gte]'] = filterParams.lastUpdateDate.toISOString();
    }

    const response = await lastValueFrom(this.httpService.get<ContentfulApiResponse>(url, { params }));

    return response.data;
  }
}
