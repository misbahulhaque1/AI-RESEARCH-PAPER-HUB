const Joi = require('joi');

// Validation schemas
const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(100).required()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  paper: Joi.object({
    title: Joi.string().required(),
    abstract: Joi.string().allow(''),
    authors: Joi.string().allow(''),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1),
    source: Joi.string().max(100),
    url: Joi.string().uri().allow(''),
    keywords: Joi.array().items(Joi.string())
  }),

  search: Joi.object({
    q: Joi.string().required().min(1).max(200),
    type: Joi.string().valid('title', 'author', 'keyword', 'all').default('all'),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    year: Joi.number().integer(),
    source: Joi.string()
  })
};

// Validation middleware factory
const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    
    if (!schema) {
      return res.status(500).json({
        success: false,
        message: 'Validation schema not found'
      });
    }

    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  };
};

module.exports = validate;
