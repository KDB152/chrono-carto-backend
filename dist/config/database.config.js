"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConfig = void 0;
require("reflect-metadata");
const dotenv = require("dotenv");
dotenv.config();
const user_entity_1 = require("../modules/users/entities/user.entity");
exports.databaseConfig = {
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'chrono_carto',
    entities: [user_entity_1.User],
    migrations: ['src/database/migrations/*.ts'],
    synchronize: true,
    logging: true,
};
//# sourceMappingURL=database.config.js.map