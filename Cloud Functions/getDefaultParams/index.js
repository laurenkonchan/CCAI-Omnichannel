const Firestore = require('@google-cloud/firestore');
    const PROJECTID = '<ADD YOUR PROJECTID>';

    const firestore = new Firestore({
      projectId: PROJECTID,
      timestampsInSnapshots: true,
    });

    exports.getDefaultParams = (req, res) => {
      
      function replaceAll(string, search, replace) {
        return string.split(search).join(replace);
      }
    
      console.log('Dialogflow Request body: ' + JSON.stringify(req.body));
      let tag = req.body.fulfillmentInfo.tag;
      console.log('Tag: ' + tag);
      
      //Decipher which channel the session is occurring on 
      sessionString = JSON.stringify(req.body.sessionInfo.session);
      console.log('Session: ' + sessionString);
      let channel = "chat"
      if (sessionString.includes("voice_call")) {
        channel = "call";
      } else if (sessionString.includes("whatsapp")) {
        channel = "whatsapp"
      }
      
      // The tag is what's specified along with the webhook URL in the flow page 
      if (tag === 'default_params') {
        // The COLLECTION_NAME is what you named the collection in Firestore.
        const COLLECTION_NAME = 'YOUR COLLECTION NAME';
        // Set service code to the service code param value collected from the user.
        //let getInfo = req.body.sessionInfo.parameters['company_name']
        //console.log('Info we want from convo is : ' + getInfo);
        // Check if required params have been populated
        if (!(req.body.sessionInfo && req.body.sessionInfo.parameters)) {
          return res.status(404).send({ error: 'Not enough information.' });
        }
        // Document id from the Firestore collection.
        const id = "YOUR DOCUMENT ID";
        console.log('Id: ' + id);
        // If id is null or empty
        if (!(id && id.length)) {
          return res.status(404).send({ error: 'Empty company name' });
        }
        return firestore.collection(COLLECTION_NAME)
        .doc(id)
        .get()
        .then(doc => {
          if (!(doc && doc.exists)) {
            res.status(200).send({
                sessionInfo: {
                  parameters: {
                    company_name: 'None'
                  }
                }
            });
          }
          const data = doc.data();
          console.log(JSON.stringify(data));
          const companyName = doc.data().company_name;
          const aptDate = doc.data().install_appointment_date;
          const aptDate2 = doc.data().install_appointment_date_2;
          const aptDate3 = doc.data().install_appointment_date_3;
          //var answer = 'Thank you for calling ' + companyName + '!';
          //console.log(answer);
          res.status(200).send({
                sessionInfo: {
                  parameters: {
                    company_name: companyName,
                    channel_type: channel,
                    install_appointment_date: aptDate,
                    install_appointment_date_2: aptDate2,
                    install_appointment_date_3: aptDate3
                  }
                }
           });
        }).catch(err => {
          console.error(err);
          return res.status(404).send({ error: 'Unable to retrieve the document' });
        });
      } else {
        res.status(200).send({});
      }
    }; 
