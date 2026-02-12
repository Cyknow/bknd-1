export const getWelcomeTemplate = (userName: string, verifyURL: string) => {
  const icons = {
    fb: 'https://img.icons8.com/fluent/48/000000/facebook-new.png',
    tw: 'https://img.icons8.com/fluent/48/000000/twitter.png',
    ig: 'https://img.icons8.com/fluent/48/000000/instagram-new.png',
    wa: 'https://img.icons8.com/fluent/48/000000/whatsapp.png',
    tg: 'https://img.icons8.com/fluent/48/000000/telegram-app.png'
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { background-color: #f3f4f6; margin: 0; padding: 40px 0; font-family: 'Segoe UI', Arial, sans-serif; }
        .container { max-width: 550px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; }
        .top-bar { height: 6px; background: #10b981; } /* Green for Welcome */
        .header { text-align: center; padding: 40px 20px; }
        .logo { font-size: 22px; font-weight: 800; color: #065f46; text-transform: uppercase; }
        .content { padding: 0 40px; line-height: 1.6; color: #4b5563; text-align: center; }
        .welcome-image { font-size: 50px; margin-bottom: 20px; }
        .footer { background-color: #f9fafb; padding: 20px 40px; font-size: 12px; color: #9ca3af; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="top-bar"></div>
        <div class="header">
          <div class="welcome-image">👋</div>
          <div class="logo">Welcome to WCC</div>
        </div>
        <div class="content">
          <p style="font-size: 20px; color: #111827; font-weight: 600;">Welcome aboard, ${userName}!</p>
          <p>We are thrilled to have you join the Weren-Care Charity Platform. Your account has been successfully created.</p>
          <p>Please verify your email address to activate your WCC account so you can log in to explore our projects, contribute to solutions, and stay updated with our impact across the World.</p>
          <p>.</p>
        <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyURL}" style="background-color: #10b981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify My Email</a>
          </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Weren-Care Charity. Follow us on our socials below.</p>
          <div style="margin-top: 10px;">
             <img src="${icons.wa}" width="24" height="24" style="margin: 0 5px;">
             <img src="${icons.tg}" width="24" height="24" style="margin: 0 5px;">
             <img src="${icons.ig}" width="24" height="24" style="margin: 0 5px;">
             <img src="${icons.fb}" width="24" height="24" style="margin: 0 5px;">
             <img src="${icons.tw}" width="24" height="24" style="margin: 0 5px;">
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};