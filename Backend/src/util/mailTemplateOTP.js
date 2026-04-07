export const generateOtpEmailTemplate = (name, otp) => {
  const displayName = name || "User";

  return {
    subject: "Password Reset OTP Code",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset OTP</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
          }
          .email-container {
            border: 1px solid #e1e1e1;
            border-radius: 5px;
            padding: 20px;
            margin: 20px auto;
          }
          .header {
            background-color: #4A90E2;
            color: white;
            padding: 15px;
            text-align: center;
            border-radius: 4px 4px 0 0;
            margin: -20px -20px 20px -20px;
          }
          .code-container {
            background-color: #f7f7f7;
            border: 1px dashed #cecece;
            padding: 15px;
            text-align: center;
            margin: 20px 0;
            border-radius: 4px;
          }
          .code {
            font-family: 'Courier New', monospace;
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #4A90E2;
          }
          .expiry {
            color: #e74c3c;
            font-weight: bold;
          }
          .footer {
            font-size: 12px;
            text-align: center;
            color: #999;
            margin-top: 30px;
            border-top: 1px solid #e1e1e1;
            padding-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h2 style="margin: 0;">Password Reset</h2>
          </div>
          
          <p>Hello ${displayName},</p>
          
          <p>We received a request to reset your password. Please use the following One-Time Password (OTP) to verify your identity:</p>
          
          <div class="code-container">
            <div class="code">${otp}</div>
          </div>
          
          <p><span class="expiry">This code will expire in 10 minutes.</span></p>
          
          <p>If you did not request this password reset, please ignore this email or contact support if you have concerns about your account security.</p>
          
          <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} MessEase. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
      `,
  };
};

export const createOtpMailOptions = (email, name, otp) => {
  const template = generateOtpEmailTemplate(name, otp);

  return {
    from: process.env.EMAIL_USER,
    to: email,
    subject: template.subject,
    html: template.html,
  };
};
