import sgMail from '@sendgrid/mail';

// Set the API Key from your environment variables
// Make sure to add SENDGRID_API_KEY to your Render Environment Variables!
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
console.log("KEY LOADED:", !!process.env.SENDGRID_API_KEY); // This will log true if the key is loaded, false otherwise


interface EmailOptions {
  email: string | string[]; // Accept either a single email or an array of emails
  subject: string;
  message: string;
  html?: string;
}

const sendMail = async (options: EmailOptions) => {
  // 1) Define the email options
  const mailOptions = {    
    from: {
      email: process.env.EMAIL_FROM || 'ctsnlgroup@gmail.com', // MUST be the email you verified as a "Single Sender" in SendGrid
      name: 'WCC Nigeria',
    },
    to: options.email, // This can now be ['a@test.com', 'b@test.com']
    subject: options.subject,
    text: options.message,
    html: options.html || `<div>${options.message}</div>`,
    // ✅ This forces click tracking OFF for this specific email send
  trackingSettings: {
    clickTracking: {
      enable: false,
      enableText: false,
    },
  },
  };

  try {
    // 2) Send the email via HTTP API (Not SMTP!)
    // const response = await sgMail.send(mailOptions);

    // 2) USE sendMultiple for bulk/private sending
    // This prevents recipients from seeing each other in the "To" field
    const response = await sgMail.sendMultiple(mailOptions);
    
    // SendGrid returns a 202 Accepted status on success
    console.log(`✅ Email(s) sent successfully to ${Array.isArray(options.email) ? options.email.length : 1} recipient(s)!`);
    console.log('Status Code:', response[0].statusCode);
    
  } catch (error: any) {
    // 3) Detailed Error Logging
    console.error('❌ SENDGRID ERROR:', {
      message: error.message,
      code: error.code,
      // If SendGrid provides a specific response body, log it
      details: error.response?.body?.errors || error.response?.body,
    });
    
    throw new Error('There was an error sending the email. Try again later!');
  }
};

export default sendMail;







//USING GMAIL SMTP SETTINGS
// import nodemailer from 'nodemailer';

// interface EmailOptions {
//   email: string;
//   subject: string;
//   message: string;
//   html?: string;
// }

// const sendMail = async (options: EmailOptions) => {
  
//   // 1) Create a transporter with Gmail-specific settings
//   const transporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com',
//   port: 587,
//   secure: false, // 💡 MUST be false for port 587
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD, // 16-character App Password (no spaces)
//     },

//     // Add this to skip certificate issues during testing
//     tls: {
//       rejectUnauthorized: false,  // Bypasses local certificate issues
//       minVersion: 'TLSv1.2'      // Ensures modern security
//     }
//     // Adding logger and debug helps you see the exact SMTP conversation in your terminal
//     // logger: true,
//     // debug: true 
//   });

//   try {
//     await transporter.verify();
//     console.log('🚀 SMTP Connection Verified!');
//   } catch (err) {
//     console.error('❌ SMTP Verification Failed:', err);
//     throw err;
//   }

// //Add this temporary "Verify" block right after you create the transporter in your code
//   transporter.verify((error, success) => {
//   if (error) {
//     console.log('❌ Transporter Configuration Error:', error);
//   } else {
//     console.log('🚀 Server is ready to take our messages');
//   }
// });

//   // 2) Define the email options
//   const mailOptions = {
//     from: `WCC Nigeria <${process.env.EMAIL_USERNAME}>`, // Gmail often blocks custom "from" domains
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//     html: options.html,
//   };

//   // Add this inside your sendMail function before transporter.sendMail
// await new Promise((resolve, reject) => {
//   transporter.verify((error, success) => {
//     if (error) {
//       console.log('❌ Transporter Configuration Error:', error);
//       reject(error);
//     } else {
//       console.log('🚀 Server is ready to take our messages');
//       resolve(success);
//     }
//   });
// });

//   // 3) Send the email
//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log('✅ Email sent successfully:', info.messageId);
//   } catch (error: any) {
//     console.log('❌ DETAILED GMAIL ERROR:', {
//       message: error.message,
//       code: error.code,       // e.g., 'EAUTH'
//       response: error.response, // The direct message from Gmail
//       command: error.command
//     });
//     throw error; // Re-throw so your controller's catch block can handle it
//   }
// };

// export default sendMail;






// import nodemailer from 'nodemailer';

// interface EmailOptions {
//   email: string;
//   subject: string;
//   message: string;
//   html?: string; // Add this optional field
// }

// const sendMail = async (options: EmailOptions) => {

//   console.log('DEBUG EMAIL CONFIG:', {
//   host: process.env.EMAIL_HOST,
//   user: process.env.EMAIL_USERNAME,
//   pass: process.env.EMAIL_PASSWORD ? 'FOUND' : 'NOT FOUND'
// }); // This will help you verify that your environment variables are being loaded correctly. Remember to remove this debug log in production to avoid exposing sensitive information.

//   // 1) Create a transporter
//   // const transporter = nodemailer.createTransport({
//   //   host: process.env.EMAIL_HOST,
//   //   port: Number(process.env.EMAIL_PORT),
//   //   auth: {
//   //     user: process.env.EMAIL_USERNAME,
//   //     pass: process.env.EMAIL_PASSWORD,
//   //   },
//   // });


// //   const transporter = nodemailer.createTransport({
// //   host: process.env.EMAIL_HOST,
// //   port: Number(process.env.EMAIL_PORT),
// //   secure: false, // Use false for port 2525 or 587
// //   auth: {
// //     user: process.env.EMAIL_USERNAME,
// //     pass: process.env.EMAIL_PASSWORD,
// //   },
// //   tls: {
// //     rejectUnauthorized: false // This helps bypass local network certificate issues
// //   }
// // });


// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: Number(process.env.EMAIL_PORT),
//   secure: true, // true for 465, false for other ports
//   auth: {
//     user: process.env.EMAIL_USERNAME,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// });

//   // 2) Define the email options
//   const mailOptions = {
//     from: 'Vanguard Admin <admin@vanguard.com>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message, // Fallback for email clients that block HTML
//     html: options.html,    // The "Commercial" version 
//   };

//   // 3) Actually send the email
//   await transporter.sendMail(mailOptions);
// };

// export default sendMail;