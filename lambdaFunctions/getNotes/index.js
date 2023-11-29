const AWS = require("aws-sdk");
const middy = require("@middy/core");
const db = new AWS.DynamoDB.DocumentClient();

const { validateToken } = require("../../middleware/auth");
const { errorHandler } = require("../../middleware/errorHandler");
const { sendResponse } = require("../../responses/sendResponse");

const getNotes = async (event) => {
  const userId = event.userId;

  try {
    const { Items } = await db
      .scan({
        TableName: "noteableNotes",
        FilterExpression: "userId = :userId AND isDeleted = :isDeleted",
        ExpressionAttributeValues: {
          ":userId": userId,
          ":isDeleted": false,
        },
      })
      .promise();
    return sendResponse(200, { success: true, notes: Items });
  } catch (error) {
    return sendResponse(400, {
      success: false,
      message: "Could not get notes",
    });
  }
};

const handler = middy(getNotes).use(validateToken).onError(errorHandler);

module.exports = { handler };
