const prometheus = require('prom-client');

// Create a Registry to store metrics
const register = new prometheus.Registry();

// Add default metrics (CPU, memory, etc.)
prometheus.collectDefaultMetrics({
  register,
  prefix: 'my_app_', // Optional prefix for metrics
});

// Example of creating a custom counter
const httpRequestsTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'status', 'route'],
  registers: [register],
});

// Example of creating a custom gauge
const activeConnections = new prometheus.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  registers: [register],
});

export { register, httpRequestsTotal, activeConnections };
