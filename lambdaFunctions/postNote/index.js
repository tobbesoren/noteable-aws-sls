const AWS = require("aws-sdk");
const { sendResponse } = require("../../responses/sendResponse");
const db = new AWS.DynamoDB.DocumentClient();
const { nanoid } = require("nanoid");

exports.handler = async (event, context) => {
  const note = JSON.parse(event.body);

  const noteId = nanoid();
  const userId = "just_testing"; // <== change this!
  const createdAt = new Date();

  note.noteId = noteId;
  note.userId = userId;
  note.createdAt = createdAt;
  note.modifiedAt = createdAt;

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
