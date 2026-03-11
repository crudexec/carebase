"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
require("dotenv/config");
require("reflect-metadata");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
require("./utils/response/customSuccess");
const errorHandler_1 = require("./middleware/errorHandler");
const getLanguage_1 = require("./middleware/getLanguage");
const dbCreateConnection_1 = require("./orm/dbCreateConnection");
const routes_1 = __importDefault(require("./routes"));
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)());
exports.app.use((0, helmet_1.default)());
exports.app.use(body_parser_1.default.json());
exports.app.use(body_parser_1.default.urlencoded({ extended: false }));
exports.app.use(getLanguage_1.getLanguage);
try {
    const accessLogStream = fs_1.default.createWriteStream(path_1.default.join(__dirname, '../log/access.log'), {
        flags: 'a',
    });
    exports.app.use((0, morgan_1.default)('combined', { stream: accessLogStream }));
}
catch (err) {
    console.log(err);
}
exports.app.use((0, morgan_1.default)('combined'));
exports.app.use('/', routes_1.default);
exports.app.use(errorHandler_1.errorHandler);
const port = process.env.PORT || 4002;
exports.app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
(async () => {
    await (0, dbCreateConnection_1.dbCreateConnection)();
})();
//# sourceMappingURL=index.js.map