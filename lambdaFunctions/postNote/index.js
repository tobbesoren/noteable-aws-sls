const AWS = require("aws-sdk");
const db = new AWS.DynamoDB.DocumentClient();
const { nanoid } = require("nanoid");
const middy = require("@middy/core");

const { sendResponse } = require("../../responses/sendResponse");
const { validateToken } = require("../../middleware/auth");

const postNote = async (event, context) => {
  if (event?.error && event.error === "401") {
    return sendResponse(401, { success: false, message: "Invalid token" });
  }

  const note = JSON.parse(event.body);

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
    return sendResponse(200, { success: true });
  } catch (error) {
    return sendResponse(500, { success: false });
  }
};

const handler = middy(postNote).use(validateToken);

module.exports = { handler };
