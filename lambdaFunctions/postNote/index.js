const AWS = require("aws-sdk");
const { nanoid } = require("nanoid");
const middy = require("@middy/core");
const jsonBodyParser = require("@middy/http-json-body-parser");

const db = new AWS.DynamoDB.DocumentClient();

const { sendResponse } = require("../../responses/sendResponse");
const { validateToken } = require("../../middleware/auth");
const { errorHandler } = require("../../middleware/errorHandler");

const postNote = async (event, context) => {
  
  const note = event.body;

  const noteId = nanoid();
  const userId = event.userId;
  const createdAt = new Date().toISOString();

  note.noteId = noteId;
  note.userId = userId;
  note.createdAt = createdAt;
  note.modifiedAt = createdAt;
  note.isDeleted = false;

  try {
    await db
      .put({
        TableName: "noteableNotes",
        Item: note,
      })
      .promise();
    return sendResponse(200, {
      success: true,
      message: "Note succesfully posted",
    });
  } catch (error) {
    return sendResponse(500, {
      success: false,
      message: "Could not post note",
    });
  }
};

const handler = middy(postNote)
  .use(validateToken)
  .use(jsonBodyParser())
  .onError(errorHandler);

module.exports = { handler };
