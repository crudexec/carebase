"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_naming_strategies_1 = require("typeorm-naming-strategies");
const isProd = process.env.NODE_ENV !== 'dev';
const basePath = isProd ? 'dist' : 'src';
const config = {
    type: 'postgres',
    name: 'default',
    url: process.env.DB_URL,
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
    namingStrategy: new typeorm_naming_strategies_1.SnakeNamingStrategy(),
};
exports.default = config;
//# sourceMappingURL=ormconfig-prod.js.map