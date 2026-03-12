function parseSection(schema, data) {
  if (!schema) {
    return data;
  }

  return schema.parse(data);
}

export function validateRequest({
  bodySchema,
  paramsSchema,
  querySchema,
  headersSchema,
} = {}) {
  return (req, res, next) => {
    try {
      if (headersSchema) {
        req.headers = parseSection(headersSchema, req.headers);
      }

      if (paramsSchema) {
        req.params = parseSection(paramsSchema, req.params);
      }

      if (querySchema) {
        req.query = parseSection(querySchema, req.query);
      }

      if (bodySchema) {
        req.body = parseSection(bodySchema, req.body);
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}
