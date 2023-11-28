const AWS = require("aws-sdk");
const db = new AWS.DynamoDB.DocumentClient();

const middy = require("@middy/core");
const { validateToken } = require("../../middleware/auth");
const { sendResponse } = require("../../responses/sendResponse");

const updateNote = async (event, context) => {
  if (event?.error && event.error === "401") {
    return sendResponse(401, { success: false, message: "Invalid token" });
  }
  const updateAttributes = JSON.parse(event.body);
  const userId = event.userId;
  const { noteId } = event.pathParameters;
  const modifiedAt = new Date().toISOString();

  const updateExpression =
    "SET modifiedAt = :modifiedAt, " +
    Object.keys(updateAttributes)
      .map((attributeName) => `#${attributeName} = :${attributeName}`)
      .join(", ");
  console.log(updateExpression);

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
      updateExpression: updateExpression,
      expressionAttributeNames: expressionAttributeNames,
      expressionAttributeValues: expressionAttributeValues,
      note: response.Attributes,
    });
  } catch (error) {
    return sendResponse(error.statusCode, {
      success: false,
      message: "Could not update note",
      error: error,
    });
  }
};

const handler = middy(updateNote).use(validateToken);

module.exports = { handler };
