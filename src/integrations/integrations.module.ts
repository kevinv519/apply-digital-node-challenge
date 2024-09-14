import { Module } from '@nestjs/common';
import { ContentfulModule } from './contentful/contentful.module';

@Module({
  imports: [ContentfulModule],
  providers: [],
  exports: [ContentfulModule],
})
export class IntegrationsModule {}
