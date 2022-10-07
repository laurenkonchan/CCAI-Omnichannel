const axios = require('axios');

// Get Enviroment Variables
const username = process.env.username;
const password = process.env.password;
const zipcode = process.env.zipcode;

const token = "Basic " + Buffer.from(`${username}:${password}`, 'utf8').toString('base64');
console.log("Token = " + token);

const functions = require("firebase-functions");
const { SessionsClient } = require("@google-cloud/dialogflow-cx");

// plug ins for dialogflow
// session creation with SMS tag
// const sessionId = Math.random().toString(36).substring(7) + "-sms";

// const client = new SessionsClient({
//   apiEndpoint: "us-central1-dialogflow.googleapis.com",
// });

exports.SMS_CCAIP = functions.https.onRequest(async (request, response) => {

  var data = JSON.stringify({
    "chat_type": "Messaging (SMS)",
    "end_user_number": "+17196601206",
    "outbound_number": " +16282774494",
    "message": "Hi Lauren, your appointment is rescheduled for October 3rd between 10am and 12pm. Please reach out with any additional questions. You can always call us at 415-636-6171."
  });

  var config = {
    method: 'post',
    url: 'https://mockitfans1-cvu2fl3.uc1.ccaiplatform.com/apps/api/v1/sms',
    headers: { 
      'Authorization': token, 
      'Content-Type': 'application/json'
    },
    data : data
  };

  axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data));
  })
  .catch(function (error) {
    console.log(error);
  });


});
