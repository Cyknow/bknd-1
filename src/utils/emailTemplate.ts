export const getPasswordResetTemplate = (userName: string, resetURL: string) => {
  const socialLinks = {
    facebook: 'https://facebook.com/WCC',
    twitter: 'https://twitter.com/WCC',
    linkedin: 'https://linkedin.com/company/WCC',
    instagram: 'https://instagram.com/WCC',
    whatsapp: 'https://wa.me/447859813287', 
    telegram: 'https://t.me/WCCNigeria' 
  };

  // Stable CDN Links (Email-Safe)
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
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { background-color: #f3f4f6; margin: 0; padding: 40px 0; font-family: 'Segoe UI', Arial, sans-serif; -webkit-font-smoothing: antialiased; }
        .container { max-width: 550px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .top-bar { height: 6px; background: linear-gradient(90deg, #2563eb, #3b82f6); }
        .header { text-align: center; padding: 40px 20px 20px; }
        .logo { font-size: 22px; font-weight: 800; color: #1e40af; text-transform: uppercase; letter-spacing: 1px; }
        .content { padding: 0 40px; line-height: 1.6; color: #4b5563; text-align: center; }
        
        .button-container { text-align: center; margin: 35px 0; }
        .button { 
          background-color: #2563eb; 
          color: #ffffff !important; 
          padding: 14px 32px; 
          text-decoration: none; 
          border-radius: 8px; 
          font-weight: 600; 
          display: inline-block;
        }

        .social-container { background-color: #f9fafb; padding: 30px 20px 10px; text-align: center; border-top: 1px solid #f1f5f9; }
        .social-label { font-size: 12px; color: #9ca3af; text-transform: uppercase; margin-bottom: 15px; display: block; letter-spacing: 1px; }
        
        .social-icon { 
          display: inline-block; 
          margin: 0 8px; 
          text-decoration: none;
        }
        /* Desktop hover effect */
        .social-icon img { 
          width: 28px !important; 
          height: 28px !important; 
          display: block;
          border: 0;
        }

        .footer { background-color: #f9fafb; padding: 10px 40px 40px; font-size: 12px; color: #9ca3af; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="top-bar"></div>
        <div class="header">
          <div class="logo">Weren-Care Charity</div>
        </div>
        
        <div class="content">
          <p style="font-size: 18px; color: #111827; font-weight: 600;">Hi ${userName},</p>
          <p>We received a request to reset the password for your WCC account. This link will expire in <strong>10 minutes</strong>.</p>
          <p>Kindly click the button below to reset your password <strong>if you made this request.</strong></p>
          <div class="button-container">
            <a href="${resetURL}" class="button">Reset Password</a>
          </div>
          <p style="font-size: 13px; color: #9ca3af;">If you didn't request this, you can safely ignore this email.</p>
        </div>        

        <div class="social-container">
          <span class="social-label">Connect with us</span>
          <a clicktracking="off" href="${socialLinks.facebook}" class="social-icon">
            <img src="${icons.fb}" alt="FB" width="28" height="28">
          </a>
          <a clicktracking="off" href="${socialLinks.twitter}" class="social-icon">
            <img src="${icons.tw}" alt="TW" width="28" height="28">
          </a>
          <a clicktracking="off" href="${socialLinks.instagram}" class="social-icon">
            <img src="${icons.ig}" alt="IG" width="28" height="28">
          </a>
          <a clicktracking="off" href="${socialLinks.whatsapp}" class="social-icon">
            <img src="${icons.wa}" alt="WA" width="28" height="28">
          </a>
          <a clicktracking="off" href="${socialLinks.telegram}" class="social-icon">
            <img src="${icons.tg}" alt="TG" width="28" height="28">
          </a>
        </div>

        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Weren-Care Charity Platform.</p>
          <p>Need help? Contact us via WhatsApp or Telegram above.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};












// export const getPasswordResetTemplate = (userName: string, resetURL: string) => {
//   const socialLinks = {
//     facebook: 'https://facebook.com/WCC',
//     twitter: 'https://twitter.com/WCC',
//     linkedin: 'https://linkedin.com/company/WCC',
//     instagram: 'https://instagram.com/WCC',
//     // Replace with your actual phone number (include country code, no + or -)
//     whatsapp: 'https://wa.me/+447859813287', 
//     // Replace with your Telegram username or group link
//     telegram: 'https://t.me/WCCNigeria' 
//   };

//   return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="utf-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <style>
//         body { background-color: #f3f4f6; margin: 0; padding: 40px 0; font-family: 'Segoe UI', Arial, sans-serif; }
//         .container { max-width: 550px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
//         .top-bar { height: 6px; background: linear-gradient(90deg, #2563eb, #3b82f6); }
//         .header { text-align: center; padding: 40px 20px 20px; }
//         .logo { font-size: 22px; font-weight: 800; color: #1e40af; text-transform: uppercase; }
//         .content { padding: 0 40px; line-height: 1.6; color: #4b5563; text-align: center; }
        
//         .button-container { text-align: center; margin: 35px 0; }
//         .button { 
//           background-color: #2563eb; 
//           color: #ffffff !important; 
//           padding: 14px 32px; 
//           text-decoration: none; 
//           border-radius: 8px; 
//           font-weight: 600; 
//           display: inline-block;
//           transition: all 0.3s ease;
//         }
//         .button:hover { background-color: #1d4ed8; transform: translateY(-2px); }

//         /* Social Section */
//         .social-container { background-color: #f9fafb; padding: 30px 20px 10px; text-align: center; }
//         .social-label { font-size: 12px; color: #9ca3af; text-transform: uppercase; margin-bottom: 15px; display: block; letter-spacing: 1px; }
        
//         .social-icon { 
//           display: inline-block; 
//           margin: 5px 8px; 
//           transition: transform 0.2s ease;
//           vertical-align: middle;
//         }
//         .social-icon:hover { transform: scale(1.15); }
//         .social-icon img { width: 28px; height: 28px; }

//         .footer { background-color: #f9fafb; padding: 0 40px 40px; font-size: 12px; color: #9ca3af; text-align: center; }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <div class="top-bar"></div>
//         <div class="header">
//           <div class="logo">Weren-Care Charity</div>
//         </div>
        
//         <div class="content">
//           <p style="font-size: 18px; color: #111827;">Hi ${userName},</p>
//           <p>We received a request to reset the password for your WCC account. This link will expire in <strong>10 minutes</strong>. If you didn't request this, you can safely ignore this email.</p>
//           <P>kindly click the button below to reset your password <strong>if you made this request.</strong></P>
//           <div class="button-container">
//             <a href="${resetURL}" class="button">Reset Password</a>
//           </div>
//         </div>        

//         <div class="social-container">
//           <span class="social-label">Connect with us</span>
//           <a href="${socialLinks.facebook}" class="social-icon"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="FB"></a>
//           <a href="${socialLinks.twitter}" class="social-icon"><img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="TW"></a>
//           <a href="${socialLinks.instagram}" class="social-icon"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="IG"></a>
          
//           <a href="${socialLinks.whatsapp}" class="social-icon">
//             <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" alt="WhatsApp">
//           </a>
//           <a href="${socialLinks.telegram}" class="social-icon">
//             <img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" alt="Telegram">
//           </a>
//         </div>

//         <div class="footer">
//           <p>&copy; ${new Date().getFullYear()} Weren-Care Charity Platform.</p>
//           <p>Need help? Contact us directly via WhatsApp or Telegram above.</p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;
// };




// export const getPasswordResetTemplate = (userName: string, resetURL: string) => {
//   const socialLinks = {
//     facebook: 'https://facebook.com/WCC',
//     twitter: 'https://twitter.com/WCC',
//     linkedin: 'https://linkedin.com/company/WCC',
//     instagram: 'https://instagram.com/WCC'
//   };

//   return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="utf-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <style>
//         .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; }
//         .header { text-align: center; padding-bottom: 20px; }
//         .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
//         .content { line-height: 1.6; color: #333333; }
//         .button-container { text-align: center; margin: 30px 0; }
//         .button { background-color: #2563eb; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; }
//         .footer { margin-top: 30px; font-size: 12px; color: #777777; text-align: center; border-top: 1px solid #eeeeee; padding-top: 20px; }
//         .social-container { padding: 20px 0; text-align: center; }
//           .social-icon { 
//             display: inline-block; 
//             margin: 0 10px; 
//             text-decoration: none;
//           }
//           .social-icon img {
//             width: 24px;
//             height: 24px;
//             display: block;
//           }
//         </style>
//     </head>
//     <body>
//       <div class="container">
//         <div class="header">
//           <div class="logo">WEREN-CARE CHARITY</div>
//         </div>
//         <div class="content">
//           <p>Hi ${userName},</p>
//           <p>We received a request to reset the password for your WCC account. Click the button below to choose a new one:</p>
//           <div class="button-container">
//             <a href="${resetURL}" class="button">Reset Password</a>
//           </div>
//           <p>This link will expire in <strong>10 minutes</strong>. If you didn't request this, you can safely ignore this email.</p>
//         </div>        
//         <div class="footer">
//           <p>You received this because you are a registered Vanguard user.</p>
//           <p><strong>Vanguard HQ:</strong> 123 Tech Avenue, San Francisco, CA 94105</p>
//           <p><a href="${process.env.FRONTEND_URL}/unsubscribe" style="color: #777;">Unsubscribe</a></p>
//           <p>&copy; ${new Date().getFullYear()} Weren-Care Charity Platform. All rights reserved.</p>
//         </div>
//         <div class="social-container">
//           <a href="${socialLinks.facebook}" class="social-icon">
//             <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook">
//           </a>
//           <a href="${socialLinks.twitter}" class="social-icon">
//             <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter">
//           </a>
//           <a href="${socialLinks.linkedin}" class="social-icon">
//             <img src="https://cdn-icons-png.flaticon.com/512/733/733561.png" alt="LinkedIn">
//           </a>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;
// };