const noteIdSchema = {
    type: "object",
    properties: {
      noteId: { type: "string", minLength: 21, maxLength: 21 },
    },
    required: ["noteId"],
    additionalProperties: false,
  };
  
  module.exports = { noteIdSchema };