const updateNoteSchema = {
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
  
  module.exports = { updateNoteSchema };