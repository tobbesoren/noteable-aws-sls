const postNoteSchema = {
    type: "object",
    properties: {
      title: { type: "string", maxLength: 50 },
      text: { type: "string", maxLength: 300 },
    },
    required: ["title", "text"],
    additionalProperties: false,
  };
  
  module.exports = { postNoteSchema };