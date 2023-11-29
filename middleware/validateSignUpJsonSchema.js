const Ajv = require("ajv");
const createError = require("http-errors");

const ajv = new Ajv();

const validateSignUpJsonSchema = {
  before: async (request) => {
    const { event } = request;

    const schema = {
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

    const validate = ajv.compile(schema);

    // Validate the JSON body against the schema
    const isValid = validate(event.body);

    if (!isValid) {
      const errorMessage = ajv.errorsText(validate.errors);
      request.error = {
        statusCode: 400,
        name: "JsonValidationError",
        message: errorMessage,
      };
      throw createError(400, errorMessage);
    }

    return;
  },
};

module.exports = { validateSignUpJsonSchema };
