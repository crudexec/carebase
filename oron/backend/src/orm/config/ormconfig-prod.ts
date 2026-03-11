import { ConnectionOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

const isProd = process.env.NODE_ENV !== 'dev';
const basePath = isProd ? 'dist' : 'src';

const config: ConnectionOptions = {
  type: 'postgres',
  name: 'default',
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: false,
  logging: false,
  entities: [`dist/orm/entities/**/*.js`],
  migrations: [`dist/orm/migrations/**/*.js`],
  subscribers: [`dist/orm/subscriber/**/*.js`],
  cli: {
    entitiesDir: 'src/orm/entities',
    migrationsDir: 'src/orm/migrations',
    subscribersDir: 'src/orm/subscriber',
  },
  namingStrategy: new SnakeNamingStrategy(),
};

export default config;
