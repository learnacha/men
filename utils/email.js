const nodemailer = require("nodemailer");

const sendMail = async (options) => {
  // 1. Create a transporter
  // 2. Define the email options
  // 3. Actually send the email with node mailer

  //   NOTE: For GMail -- Activate "less secure app" option

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "Sri Hari Acha <srihari@acha.io",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendMail;
