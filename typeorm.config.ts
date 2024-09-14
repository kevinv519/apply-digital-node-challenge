import { config as dotenvConfig } from 'dotenv';
import { DataSource } from 'typeorm';
import databaseConfig from './src/config/database.config';

dotenvConfig();

const dataSource = new DataSource({
  type: 'postgres',
  ...databaseConfig(),
});

export default dataSource;
