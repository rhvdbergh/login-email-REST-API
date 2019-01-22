"use strict";
const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
async function sendMail(userName, userEmail, subject, message){

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_ACCOUNT, // generated ethereal user
      pass: process.env.EMAIL_PASS // generated ethereal password
    }
  });

  // setup email data with unicode symbols
  let mailOptions = {
    from: '"Signie" <signupfrustration@gmail.com>', // sender address
    to: userEmail, // list of receivers
    subject: subject, // Subject line
    text: message, // plain text body
    html: `<p>${message}</p>` // html body
  };

  // send mail with defined transport object
  let info = await transporter.sendMail(mailOptions)

  console.log("Message sent: %s", info.messageId);
  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

// main().catch(console.error);

module.exports.sendMail = sendMail;