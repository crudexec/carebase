import { httpRequestsTotal } from '../../metrics'; // Ensure the correct import

const countRequests = (req, res, next) => {
  const originalEnd = res.end; // Save the original res.end method

  res.end = (...args) => {
    // Increment the counter for this request
    httpRequestsTotal.inc({
      method: req.method,
      route: req.originalUrl,
      status: res.statusCode,
    });

    // Call the original res.end method
    originalEnd.apply(res, args);
  };

  next(); // Proceed to the next middleware or route handler
};

export { countRequests };
