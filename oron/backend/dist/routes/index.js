"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const _404_1 = __importDefault(require("./pages/404"));
const root_1 = __importDefault(require("./pages/root"));
const v1_1 = __importDefault(require("./v1"));
const metrics_1 = require("metrics");
const router = (0, express_1.Router)();
router.use('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', metrics_1.register.contentType);
        res.end(await metrics_1.register.metrics());
    }
    catch (err) {
        res.status(500).end;
    }
});
router.use(`/v1`, v1_1.default);
router.use(root_1.default);
router.use(_404_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map