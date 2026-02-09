import nodemailer from 'nodemailer';

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string; // Add this optional field
}

const sendMail = async (options: EmailOptions) => {

  console.log('DEBUG EMAIL CONFIG:', {
  host: process.env.EMAIL_HOST,
  user: process.env.EMAIL_USERNAME,
  pass: process.env.EMAIL_PASSWORD ? 'FOUND' : 'NOT FOUND'
}); // This will help you verify that your environment variables are being loaded correctly. Remember to remove this debug log in production to avoid exposing sensitive information.

  // 1) Create a transporter
  // const transporter = nodemailer.createTransport({
  //   host: process.env.EMAIL_HOST,
  //   port: Number(process.env.EMAIL_PORT),
  //   auth: {
  //     user: process.env.EMAIL_USERNAME,
  //     pass: process.env.EMAIL_PASSWORD,
  //   },
  // });


//   const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: Number(process.env.EMAIL_PORT),
//   secure: false, // Use false for port 2525 or 587
//   auth: {
//     user: process.env.EMAIL_USERNAME,
//     pass: process.env.EMAIL_PASSWORD,
//   },
//   tls: {
//     rejectUnauthorized: false // This helps bypass local network certificate issues
//   }
// });


const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

  // 2) Define the email options
  const mailOptions = {
    from: 'Vanguard Admin <admin@vanguard.com>',
    to: options.email,
    subject: options.subject,
    text: options.message, // Fallback for email clients that block HTML
    html: options.html,    // The "Commercial" version 
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

export default sendMail;