const AWS = require("aws-sdk");
const db = new AWS.DynamoDB.DocumentClient();

const middy = require("@middy/core");
const { validateToken } = require("../../middleware/auth");
const { sendResponse } = require("../../responses/sendResponse");

const deleteArchivedNote = async (event, context) => {
  if (event?.error && event.error === "401") {
    return sendResponse(401, { success: false, message: "Invalid token" });
  }

  const userId = event.userId;
  const noteId = JSON.parse(event.body).noteId;

  try {
    await db
      .delete({
        TableName: "noteableNotes",
        Key: { userId: userId, noteId: noteId },
        ConditionExpression: "isDeleted = :isDeleted",
        ExpressionAttributeValues: {
          ":isDeleted": true,
        }
      })
      .promise();
    return sendResponse(200, { success: true, message: "Note deleted" });
  } catch (error) {
    return sendResponse(500, {
      success: false,
      message: "Could not delete note",
      error: error,
    });
  }
};

const handler = middy(deleteArchivedNote).use(validateToken);

module.exports = { handler };
