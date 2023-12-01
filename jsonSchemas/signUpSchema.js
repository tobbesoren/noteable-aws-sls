const signUpSchema = {
    type: "object",
    properties: {
      username: {
        type: "string",
        minLength: 3,
        maxLength: 20,
        pattern: "^[a-zA-Z0-9_]+$",
      },
      password: {
        type: "string",
        minLength: 8,
        maxLength: 25,
        pattern: "^[a-zA-Z0-9!@#$%^&*]+$",
      },
      firstName: {
        type: "string",
        minLength: 1,
        maxLength: 50,
        pattern: "^[a-zA-Z/'/´/`åäöÅÄÖœæøÆØ]+$",
      },
      lastName: {
        type: "string",
        minLength: 1,
        maxLength: 50,
        pattern: "^[a-zA-Z/'/´/`åäöÅÄÖœæøÆØ]+$",
      },
    },
    required: ["username", "password", "firstName", "lastName"],
    additionalProperties: false,
  };
  
  module.exports = { signUpSchema };