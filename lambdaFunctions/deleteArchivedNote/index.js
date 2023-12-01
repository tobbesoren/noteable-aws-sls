const AWS = require("aws-sdk");
const middy = require("@middy/core");
const jsonBodyParser = require("@middy/http-json-body-parser");

const { validateToken } = require("../../middleware/auth");
const { sendResponse } = require("../../responses/sendResponse");
const { errorHandler } = require("../../middleware/errorHandler");
const { validateJsonSchema} = require("../../middleware/validateJsonSchema")
const { noteIdSchema } = require("../../jsonSchemas/noteIdSchema");

const db = new AWS.DynamoDB.DocumentClient();

const deleteArchivedNote = async (event) => {
  const userId = event.userId;
  const noteId = event.body.noteId;

  try {
    await db
      .delete({
        TableName: "noteableNotes",
        Key: { userId: userId, noteId: noteId },
        ConditionExpression: "isDeleted = :isDeleted",
        ExpressionAttributeValues: {
          ":isDeleted": true,
        },
      })
      .promise();
    return sendResponse(200, { success: true, message: "Note deleted" });
  } catch (error) {
    if(error.message === "The conditional request failed") {
      return sendResponse(error.statusCode, {
        success: false,
        message: "Could not delete note: The note could not be found in archive",
      });
    }
    return sendResponse(error.statusCode, {
      success: false,
      message: "Could not delete note: " + error.message,
      
    });
  }
};

const handler = middy(deleteArchivedNote)
  .use(validateToken)
  .use(jsonBodyParser())
  .use(validateJsonSchema(noteIdSchema))
  .onError(errorHandler);

module.exports = { handler };
