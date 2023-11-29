const AWS = require("aws-sdk");
const middy = require("@middy/core");
const jsonBodyParser = require("@middy/http-json-body-parser");

const { validateToken } = require("../../middleware/auth");
const { sendResponse } = require("../../responses/sendResponse");
const { errorHandler } = require("../../middleware/errorHandler");
const {
  validateUpdateNoteJsonSchema,
} = require("../../middleware/validateUpdateNoteJsonSchema");

const db = new AWS.DynamoDB.DocumentClient();

const updateNote = async (event) => {
  const { noteId, ...updateAttributes } = event.body;
  const userId = event.userId;

  const modifiedAt = new Date().toISOString();

  const updateExpression =
    "SET modifiedAt = :modifiedAt, " +
    Object.keys(updateAttributes)
      .map((attributeName) => `#${attributeName} = :${attributeName}`)
      .join(", ");

  let expressionAttributeValues = Object.keys(updateAttributes).reduce(
    (values, attributeName) => {
      values[`:${attributeName}`] = updateAttributes[attributeName];
      return values;
    },
    { ":modifiedAt": modifiedAt, ":isDeleted": false }
  );
  console.log(expressionAttributeValues);

  let expressionAttributeNames = Object.keys(updateAttributes).reduce(
    (values, attributeName) => {
      values[`#${attributeName}`] = `${attributeName}`;
      return values;
    },
    {}
  );

  try {
    const response = await db
      .update({
        TableName: "noteableNotes",
        Key: { userId: userId, noteId: noteId },
        ReturnValues: "ALL_NEW",
        UpdateExpression: updateExpression,
        ConditionExpression: "isDeleted = :isDeleted",
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
      })
      .promise();

    return sendResponse(200, {
      success: true,
      message: "Note is updated",
      note: response.Attributes,
    });
  } catch (error) {
    return sendResponse(error.statusCode, {
      success: false,
      message: "Could not update note: " + error.message,
      
    });
  }
};

const handler = middy(updateNote)
  .use(validateToken)
  .use(jsonBodyParser())
  .use(validateUpdateNoteJsonSchema)
  .onError(errorHandler);

module.exports = { handler };
