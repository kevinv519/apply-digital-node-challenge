import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentfulModule } from '../integrations/contentful/contentful.module';
import { ProductEntity } from './entities/product.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity]), ContentfulModule],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}
