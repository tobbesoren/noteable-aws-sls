const Ajv = require("ajv");
const createError = require("http-errors");

const ajv = new Ajv();

const validateJsonSchema = (schema) => {
  const validate = ajv.compile(schema);

  return {
    before: (request) => {
      const { event } = request;

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
    },
  };
};

module.exports = { validateJsonSchema };
