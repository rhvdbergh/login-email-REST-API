"use strict";
const nodemailer = require("nodemailer");

// var to set for code reuse 
const SENDER_EMAIL_ADDRESS = '"Signie" <signupfrustration@gmail.com>';
const HOST = 'smtp.gmail.com';
const PORT = 465; 

// async..await is not allowed in global scope, must use a wrapper
async function sendMail(userName, userEmail, subject, message){

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: HOST,
    port: PORT,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_ACCOUNT, 
      pass: process.env.EMAIL_PASS 
    }
  });

  // setup email data - could include unicode symbols
  let mailOptions = {
    from: SENDER_EMAIL_ADDRESS, // sender address
    to: userEmail, // list of receivers
    subject: subject, // Subject line
    text: message, // plain text body
    html: `<p>${message}</p>` // html body
  };

  // send mail with defined transport object
  let info = await transporter.sendMail(mailOptions)

  console.log("Message sent: %s", info.messageId);
}

module.exports.sendMail = sendMail;