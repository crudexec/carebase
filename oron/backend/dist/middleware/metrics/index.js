"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countRequests = void 0;
const metrics_1 = require("../../metrics");
const countRequests = (req, res, next) => {
    const originalEnd = res.end;
    res.end = (...args) => {
        metrics_1.httpRequestsTotal.inc({
            method: req.method,
            route: req.originalUrl,
            status: res.statusCode,
        });
        originalEnd.apply(res, args);
    };
    next();
};
exports.countRequests = countRequests;
//# sourceMappingURL=index.js.map