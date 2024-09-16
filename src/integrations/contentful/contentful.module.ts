import { Module } from '@nestjs/common';
import { ContentfulService } from './services/contentful.service';
import { ConfigModule } from '@nestjs/config';
import contentfulConfig from './config/contentful.config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule.forFeature(contentfulConfig), HttpModule],
  providers: [ContentfulService],
  exports: [ContentfulService],
})
export class ContentfulModule {}
