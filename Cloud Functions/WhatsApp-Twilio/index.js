// Get Enviroment Variables
const accountSid = process.env.accountSid;
const authToken = process.env.authToken;
const location = process.env.location; 
const projectId = process.env.projectId; 
const agentId = process.env.agentId; 
const languageCode = process.env.languageCode;

// Initialization
const functions = require("firebase-functions");
const clientTwilio = require("twilio")(accountSid, authToken);
const { SessionsClient } = require("@google-cloud/dialogflow-cx");

//Session management: one single session for individual customers
//const sessionId = Math.random().toString(36).substring(7) + "-whatsapp";
const sessionId = "<INSERT UNIQUE ID>-whatsapp";

// Set API URI according to your agent's location
const client = new SessionsClient({
  apiEndpoint: "us-central1-dialogflow.googleapis.com",
});

// Twilio Integration
exports.WhatsAppTwilio = functions.https.onRequest(async (request, response) => {

  // Get WhatsApp Message Information
  const body = request.body;
  const receivedMsg = body.Body;
  console.log("Received Message: " + receivedMsg);
  const userNumber = body.From;
  const myNumber = request.body.To;

  // Configure Dialogflow CX Session
  const sessionPath = client.projectLocationAgentSessionPath(
    projectId,
    location,
    agentId,
    sessionId
  );


  if (receivedMsg) {

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: [receivedMsg],
        },
        languageCode,
      }
    };

    console.log(request);

    // Get Dialogflow CX Response
    try {
      const [response] = await client.detectIntent(request);
      console.log(
        `Dialogflow Request: ${JSON.stringify(response.queryResult)}`
      );

      // Iterate over every message
      for (const message of response.queryResult.responseMessages) {
        // Send Text Message
        if (message.text) {
          console.log(`Agent Response: ${message.text.text}`);
          const responseMsg = message.text.text;
          const body = {
            from: myNumber,
            body: responseMsg,
            to: userNumber,
          };
          await clientTwilio.messages.create(body);
        }
      }
      if (response.queryResult.match.intent) {
        console.log(
          `Matched Intent: ${response.queryResult.match.intent.displayName}`
        );
      }
      console.log(
        `Current Page: ${response.queryResult.currentPage.displayName}`
      );
    } catch (e) {
      console.log(e);
    }
  }
  response.status(200).send("Message Sent!");
});
