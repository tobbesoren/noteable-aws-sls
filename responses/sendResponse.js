function sendResponse(code, response) {
    return {
        statusCode: code,
        headers: {
            "Content-type": "application/json",
            'Access-Control-Allow-Origin': '*', 
            'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE',
            'Access-Control-Allow-Headers': 'Content-Type'  
        },
        body: JSON.stringify(response)
    };
}


module.exports = { sendResponse }