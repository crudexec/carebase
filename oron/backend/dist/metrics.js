"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activeConnections = exports.httpRequestsTotal = exports.register = void 0;
const prometheus = require('prom-client');
const register = new prometheus.Registry();
exports.register = register;
prometheus.collectDefaultMetrics({
    register,
    prefix: 'my_app_',
});
const httpRequestsTotal = new prometheus.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'status', 'route'],
    registers: [register],
});
exports.httpRequestsTotal = httpRequestsTotal;
const activeConnections = new prometheus.Gauge({
    name: 'active_connections',
    help: 'Number of active connections',
    registers: [register],
});
exports.activeConnections = activeConnections;
//# sourceMappingURL=metrics.js.map