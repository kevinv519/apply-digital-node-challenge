import { Column, DeleteDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { DecimalColumnTransformer } from '../../core/typeorm/transformers/numeric.transformer';

@Entity({ name: 'product' })
export class ProductEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'contentful_id', unique: true })
  contentfulId: string;

  @Column({ name: 'sku', unique: true })
  sku: string;

  @Column()
  name: string;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column()
  category: string;

  @Column()
  color: string;

  @Column({ transformer: new DecimalColumnTransformer() })
  price: number;

  @Column()
  currency: string;

  @Column({ transformer: new DecimalColumnTransformer() })
  stock: number;

  /**
   * Creation Date in Contentful
   */
  @Column({ name: 'created_at' })
  createdAt: Date;

  /**
   * Update Date in Contentful
   */
  @Column({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
