export const getPasswordResetTemplate = (userName: string, resetURL: string) => {
  const socialLinks = {
    facebook: 'https://facebook.com/vanguard',
    twitter: 'https://twitter.com/vanguard',
    linkedin: 'https://linkedin.com/company/vanguard',
    instagram: 'https://instagram.com/vanguard'
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; }
        .header { text-align: center; padding-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
        .content { line-height: 1.6; color: #333333; }
        .button-container { text-align: center; margin: 30px 0; }
        .button { background-color: #2563eb; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; }
        .footer { margin-top: 30px; font-size: 12px; color: #777777; text-align: center; border-top: 1px solid #eeeeee; padding-top: 20px; }
        .social-container { padding: 20px 0; text-align: center; }
          .social-icon { 
            display: inline-block; 
            margin: 0 10px; 
            text-decoration: none;
          }
          .social-icon img {
            width: 24px;
            height: 24px;
            display: block;
          }
        </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">VANGUARD</div>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          <p>We received a request to reset the password for your Vanguard account. Click the button below to choose a new one:</p>
          <div class="button-container">
            <a href="${resetURL}" class="button">Reset Password</a>
          </div>
          <p>This link will expire in <strong>10 minutes</strong>. If you didn't request this, you can safely ignore this email.</p>
        </div>        
        <div class="footer">
          <p>You received this because you are a registered Vanguard user.</p>
          <p><strong>Vanguard HQ:</strong> 123 Tech Avenue, San Francisco, CA 94105</p>
          <p><a href="${process.env.FRONTEND_URL}/unsubscribe" style="color: #777;">Unsubscribe</a></p>
          <p>&copy; ${new Date().getFullYear()} Vanguard Platform. All rights reserved.</p>
        </div>
        <div class="social-container">
          <a href="${socialLinks.facebook}" class="social-icon">
            <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook">
          </a>
          <a href="${socialLinks.twitter}" class="social-icon">
            <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter">
          </a>
          <a href="${socialLinks.linkedin}" class="social-icon">
            <img src="https://cdn-icons-png.flaticon.com/512/733/733561.png" alt="LinkedIn">
          </a>
        </div>
      </div>
    </body>
    </html>
  `;
};