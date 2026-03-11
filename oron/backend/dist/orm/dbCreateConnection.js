"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbCreateConnection = void 0;
const typeorm_1 = require("typeorm");
const ormconfig_1 = __importDefault(require("./config/ormconfig"));
const dbCreateConnection = async () => {
    try {
        const conn = await (0, typeorm_1.createConnection)(ormconfig_1.default);
        console.log(`Database connection success. Connection name: '${conn.name}' Database: '${conn.options.database}'`);
    }
    catch (err) {
        if (err.name === 'AlreadyHasActiveConnectionError') {
            const activeConnection = (0, typeorm_1.getConnectionManager)().get(ormconfig_1.default.name);
            return activeConnection;
        }
        console.log(err);
    }
    return null;
};
exports.dbCreateConnection = dbCreateConnection;
//# sourceMappingURL=dbCreateConnection.js.map