const AWS = require("aws-sdk");
const { nanoid } = require("nanoid");
const bcrypt = require("bcryptjs");
const middy = require("@middy/core");
const jsonBodyParser = require("@middy/http-json-body-parser");

const { sendResponse } = require("../../responses/sendResponse");
const { errorHandler } = require("../../middleware/errorHandler");
const { validateSignUpJsonSchema} = require("../../middleware/validateSignUpJsonSchema")

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

// Not used yet! Should be modified and used to check if a userName is already taken
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

async function createLogInDetails(username, password, firstName, lastName) {
  // check if username already exists
  // if username exists => return {error}

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
  .use(validateSignUpJsonSchema)
  .onError(errorHandler);

module.exports = { handler };