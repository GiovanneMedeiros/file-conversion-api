export function sendSuccess(res, statusCode, payload) {
  return res.status(statusCode).json(payload);
}

export function sendError(res, statusCode, message, options = {}) {
  const body = { error: message };

  if (options.code) {
    body.code = options.code;
  }

  if (options.details) {
    body.details = options.details;
  }

  return res.status(statusCode).json(body);
}
