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