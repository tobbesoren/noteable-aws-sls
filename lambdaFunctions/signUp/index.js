const AWS = require("aws-sdk");
const { nanoid } = require("nanoid");
const bcrypt = require("bcryptjs");
const middy = require("@middy/core");
const jsonBodyParser = require("@middy/http-json-body-parser");

const { sendResponse } = require("../../responses/sendResponse");
const { errorHandler } = require("../../middleware/errorHandler");
const { validateJsonSchema} = require("../../middleware/validateJsonSchema")
const { signUpSchema } = require("../../jsonSchemas/signUpSchema");

const db = new AWS.DynamoDB.DocumentClient();

async function createAccount(
  username,
  hashedPassword,
  userId,
  firstName,
  lastName
) {
  try {
    await db
      .put({
        TableName: "noteableAccounts",
        Item: {
          username: username,
          password: hashedPassword,
          userId: userId,
          firstName: firstName,
          lastName: lastName,
        },
      })
      .promise();
    return { success: true, message: "Account created", userId: userId };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Could not create account",
      error: error,
    };
  }
}

async function checkUsername(username) {
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
      return { success: false, message: "Username unavailable" };
    } else {
      return { success: true, message: "Username available" };
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: "Database error" };
  }
}

async function createLogInDetails(username, password, firstName, lastName) {
  // check if username already exists
  const userNameAvailable = await checkUsername(username);

  if (!userNameAvailable.success) {
    return userNameAvailable;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  const userId = nanoid();

  const createAccountResult = await createAccount(
    username,
    hashedPassword,
    userId,
    firstName,
    lastName
  );
  return createAccountResult;
}

const signUp = async (event) => {
  const { username, password, firstName, lastName } = event.body;

  const signUpResult = await createLogInDetails(username, password, firstName, lastName);

  return sendResponse(signUpResult.success ? 200: 400, signUpResult);
};

const handler = middy(signUp)
  .use(jsonBodyParser())
  .use(validateJsonSchema(signUpSchema))
  .onError(errorHandler);

module.exports = { handler };