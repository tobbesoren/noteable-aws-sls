const Ajv = require("ajv");
const createError = require("http-errors");

const ajv = new Ajv();

const validateUpdateNoteJsonSchema = {
  before: async (request) => {
    const { event } = request;

    const schema = {
      type: "object",
      properties: {
        noteId: { type: "string", minLength: 21, maxLength: 21 },
        title: {type: "string", maxLength: 50},
        text: { type: "string", maxLength: 300}
      },
      required: ["noteId"],
      anyOf: [
        { required: ["title"] },
        { required: ["text"] },
      ],
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

module.exports = { validateUpdateNoteJsonSchema };
