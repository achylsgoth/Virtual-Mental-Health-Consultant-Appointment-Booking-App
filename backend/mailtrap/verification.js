const Nodemailer = require("nodemailer");
const { MailtrapTransport } = require("mailtrap");
require('dotenv').config();

const TOKEN = process.env.MAILTRAP_TOKEN;
const transport = Nodemailer.createTransport(
  MailtrapTransport({
    token: TOKEN,
  })
);

const sender = {
  address: "hello@demomailtrap.com",
  name: "HealNest",
};
const recipients = [
  "magaranish880@gmail.com",
];

module.exports = {sender, transport};