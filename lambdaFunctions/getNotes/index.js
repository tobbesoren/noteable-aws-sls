const AWS = require("aws-sdk");
const { sendResponse } = require("../../responses/sendResponse");
const middy = require("@middy/core");


const { validateToken } = require("../../middleware/auth");
const db = new AWS.DynamoDB.DocumentClient();

const getNotes = async (event, context) => {
  if (event?.error && event.error === "401") {
    return sendResponse(401, { success: false, message: "Invalid token" });
  }

  try {
    const { Items } = await db
      .scan({
        TableName: "noteableNotes",
      })
      .promise();
    return sendResponse(200, { success: true, notes: Items });
  } catch (error) {
    return sendResponse(400, { success: false, message: "Could not get notes" });
  }
};

const handler = middy(getNotes).use(validateToken);

module.exports = { handler };