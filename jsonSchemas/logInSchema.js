const logInSchema = {
    type: "object",
    properties: {
      // We don't check for pattern here,
      // we don't want to give an attacker any hints
      // Ok, maybe we should check for ridiculously long strings...
      username: {
        type: "string",
        maxLength: 100,
      },
      password: {
        type: "string",
        maxLength: 100,
      },
    },
    required: ["username", "password"],
    additionalProperties: false,
  };
  
  module.exports = { logInSchema };