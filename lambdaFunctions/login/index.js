const AWS = require("aws-sdk");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const middy = require("@middy/core");
const jsonBodyParser = require("@middy/http-json-body-parser");

const { secret } = require("../../secret")
const { sendResponse } = require("../../responses/sendResponse");
const { errorHandler } = require("../../middleware/errorHandler");
const { validateJsonSchema} = require("../../middleware/validateJsonSchema")
const { logInSchema } = require("../../jsonSchemas/logInSchema");
const db = new AWS.DynamoDB.DocumentClient();

async function getUser(username) {
  try {
    const user = await db
      .get({
        TableName: "noteableAccounts",
        Key: {
          username: username,
        },
      })
      .promise();
    if (user?.Item) {
      return { success: true, message: "User found!", user: user.Item };
    } else {
      return { success: false, message: "Incorrect username and/or password" }; // we don't want to tell the user which one is wrong of the two!
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: "Database error", };
  }
}

async function loginUser(username, password) {
  const userResponse = await getUser(username);

  if (!userResponse.success) {
    return userResponse;
  }

  const user = userResponse.user;

  const correctPassword = await bcrypt.compare(password, user.password);

  if (!correctPassword) {
    return { success: false, message: "Incorrect username and/or password" };
  }

  const token = jwt.sign(
    { id: user.userId, username: user.username },
    secret,
    { expiresIn: "24h" } // I need more time...
  );
  return { success: true, message: "Login successful", token: token };
}

const login = async (event, context) => {
  const { username, password } = event.body;
  const loginResponse = await loginUser(username, password);

  return sendResponse(loginResponse.success ? 200 : 401, loginResponse);
};

const handler = middy(login)
  .use(jsonBodyParser())
  .use(validateJsonSchema(logInSchema))
  .onError(errorHandler);

module.exports = { handler };