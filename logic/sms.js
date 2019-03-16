require("dotenv"); 

// Get Twilio setup
const accountSid = process.env.TWILIOACOUNTSID;
const authToken = process.env.TWILIOAUTHTOKEN;
var twilio = require('twilio');
var client = new twilio(accountSid, authToken);

module.exports = function (user, message, smsCount, messageLogCallback) {
    var mediaUrl = 'https://s3.amazonaws.com/dfc_attachments/images/3537147/textadorLogoWhiteSmall.jpg';
    var messageBody = message.body.Body.trim().toLowerCase();
    var messageNumber = message.body.From;
    var systemNumber = message.body.To;
    var smsCount = smsCount;

    console.log("Incoming from: " + messageNumber);
    console.log("System to: " + systemNumber);
    console.log("Message: " + messageBody);
    console.log("Message: " + smsCount);


};