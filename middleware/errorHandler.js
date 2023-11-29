// Uncaught errors should be picked up here; for example invalid
// JSON
const { sendResponse } = require("../responses/sendResponse");

const errorHandler = async (request) => {
  console.error("Hi! from errorHandler  ", "Error: ", request.error);

  //If the data provided with the request isn't a valid JSON
  if (request.error.statusCode === 415) {
    request.error.message = "Not a valid JSON";
  }

  if (request?.error) {
    return sendResponse(request.error.statusCode, {
      handledBy: "errorHandler1",
      success: false,
      errorType: request.error.name,
      errorMessage: request.error.message,
    });
  }

  // If something goes seriously wrong without a proper request.error
  return sendResponse(500, {
    handledBy: "errorHandler2",
    success: false,
    errorType: "InternalServerError",
    errorMessage: "Something went wrong...",
  });
};

module.exports = { errorHandler };
