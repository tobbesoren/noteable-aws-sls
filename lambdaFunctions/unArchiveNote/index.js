const AWS = require("aws-sdk");
const middy = require("@middy/core");
const jsonBodyParser = require("@middy/http-json-body-parser");

const { validateToken } = require("../../middleware/auth");
const { sendResponse } = require("../../responses/sendResponse");
const { errorHandler } = require("../../middleware/errorHandler");
const { validateNoteIdJsonSchema} = require("../../middleware/validateNoteIdJsonSchema")

const db = new AWS.DynamoDB.DocumentClient();

const unArchiveNote = async (event) => {
  
  const userId = event.userId;
  const noteId = event.body.noteId;

  try {
    await db
      .update({
        TableName: "noteableNotes",
        Key: { userId: userId, noteId: noteId },
        ConditionExpression: "attribute_exists(noteId)",
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
      message: "Could not restore note: " + error.message,
      
    });
  }
};

const handler = middy(unArchiveNote)
  .use(validateToken)
  .use(jsonBodyParser())
  .use(validateNoteIdJsonSchema)
  .onError(errorHandler);

module.exports = { handler };