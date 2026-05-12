const { z } = require('zod');
const { ValidationError } = require('../utils/errors');

const validate = (schema) => (req, res, next) => {
  try {
    // Validamos body, query y params según el schema
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    const errorMessage = error.errors
      .map((details) => `${details.path.join('.')}: ${details.message}`)
      .join(', ');
    next(new ValidationError(errorMessage));
  }
};

module.exports = validate;
