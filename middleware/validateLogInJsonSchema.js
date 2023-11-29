const Ajv = require("ajv");
const createError = require("http-errors");

const ajv = new Ajv();

const validateLogInJsonSchema = {
  before: async (request) => {
    const { event } = request;

    const schema = {
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

module.exports = { validateLogInJsonSchema };
