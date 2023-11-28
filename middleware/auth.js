const jwt = require("jsonwebtoken");
const { secret } = require("../secret");

const validateToken = {
  before: async (request) => {
    try {
      const token = request.event.headers.authorization.replace("Bearer ", "");

      if (!token) throw new Error();
      console.log(token);
      const data = jwt.verify(token, secret);

      request.event.userId = data.id;
      request.event.username = data.username;

      return request.response;
    } catch (error) {
      console.error(error);
      request.event.error = "401";
      return request.response;
    }
  },
  onError: async (request) => {
    request.event.error = "401";
    return request.response;
  },
};

module.exports = { validateToken };
