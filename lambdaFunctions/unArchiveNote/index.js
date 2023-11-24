const AWS = require("aws-sdk");
const db = new AWS.DynamoDB.DocumentClient();

const middy = require("@middy/core");
const { validateToken } = require("../../middleware/auth");
const { sendResponse } = require("../../responses/sendResponse");

const archiveNote = async (event, context) => {
  if (event?.error && event.error === "401") {
    return sendResponse(401, { success: false, message: "Invalid token" });
  }
  const userId = event.userId;
  const noteId = JSON.parse(event.body).noteId;

  try {
    await db
      .update({
        TableName: "noteableNotes",
        Key: { userId: userId, noteId: noteId },
        ReturnValues: "ALL_NEW",
        UpdateExpression: "SET isDeleted = :isDeleted",
        ExpressionAttributeValues: {
          ":isDeleted": false,
        },
      })
      .promise();

    return sendResponse(200, {
      success: true,
      message: "Note is restored",
    });
  } catch (error) {
    return sendResponse(error.statusCode, {
      success: false,
      message: "Could not restore note",
      error: error,
    });
  }
};

const handler = middy(archiveNote).use(validateToken);

module.exports = { handler };
