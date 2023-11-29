const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const { secret } = require("../secret");

const validateToken = {
  before: async (request) => {
    try {
      if (!request.event.headers || !request.event.headers.authorization) {
        request.error = {
          statusCode: 401,
          name: "JsonWebTokenError",
          message: "Token not found",
        };
        throw createError(request.error.statusCode, request.error.message);
      }

      const token = request.event.headers.authorization.replace("Bearer ", "");

      if (!token || token.length === 0) {
        request.error = {
          statusCode: 401,
          name: "JsonWebTokenError",
          message: "Token not found",
        };
        throw createError(request.error.statusCode, request.error.message);
      }
      console.log(token);
      const data = jwt.verify(token, secret);

      request.event.userId = data.id;
      request.event.username = data.username;

      return;
    } catch (error) {
      request.error = error;
      request.error.statusCode = 401;
      console.error(error);
      throw error;
    }
  },
};

module.exports = { validateToken };
