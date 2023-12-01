const AWS = require("aws-sdk");
const middy = require("@middy/core");
const db = new AWS.DynamoDB.DocumentClient();

const { validateToken } = require("../../middleware/auth");
const { errorHandler } = require("../../middleware/errorHandler");
const { sendResponse } = require("../../responses/sendResponse");

const getArchivedNotes = async (event) => {
  const userId = event.userId;

  try {
    const { Items } = await db
      .query({
        TableName: "noteableNotes",
        KeyConditionExpression: "userId = :userId",
        FilterExpression: "isDeleted = :isDeleted",
        ExpressionAttributeValues: {
          ":userId": userId,
          ":isDeleted": true,
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

const handler = middy(getArchivedNotes)
  .use(validateToken)
  .onError(errorHandler);

module.exports = { handler };
