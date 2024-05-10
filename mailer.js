const nodemailer = require("nodemailer");
const dotenv = require("dotenv").config();
const transporter = nodemailer.createTransport({
  host: "SMTPConnection.gmail.com",
  service: "gmail",
  auth: {
    user: process.env.MY_EMAIL,
    pass: process.env.MY_PASS,
  },
});

const sendMail = async (email, subject, message) => {
  try {
    await transporter.sendMail({
      from: process.env.MY_EMAIL,
      to: email,
      subject: subject,
      text: message,
    });

    console.log("Email sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending email:", error);

    return false;
  }
};

module.exports = sendMail;
