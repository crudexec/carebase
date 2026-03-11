"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_naming_strategies_1 = require("typeorm-naming-strategies");
const isProd = process.env.NODE_ENV !== 'dev';
const basePath = isProd ? 'dist' : 'src';
const config = {
    type: 'postgres',
    name: 'default',
    host: process.env.PG_HOST,
    port: Number(process.env.PG_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    synchronize: false,
    logging: false,
    entities: [`${basePath}/orm/entities/**/*.{js,ts}`],
    migrations: [`${basePath}/orm/migrations/**/*.{js,ts}`],
    subscribers: [`${basePath}/orm/subscriber/**/*.{js,ts}`],
    cli: {
        entitiesDir: 'src/orm/entities',
        migrationsDir: 'src/orm/migrations',
        subscribersDir: 'src/orm/subscriber',
    },
    namingStrategy: new typeorm_naming_strategies_1.SnakeNamingStrategy(),
};
exports.default = config;
//# sourceMappingURL=ormconfig.js.map