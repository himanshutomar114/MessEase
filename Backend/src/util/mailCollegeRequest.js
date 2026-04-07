import { SERVER_URL } from "../constants.js";

export const generateCollegeVerificationEmail = (
  name,
  currentDate,
  domain,
  adminPost,
  website,
  contactEmail,
  contactPhone,
  formattedAddress,
  code
) => {
  return {
    subject: `New College Verification Request: ${name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>College Verification Request</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .email-container {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
          }
          .email-header {
            background-color: #3949ab;
            color: white;
            padding: 20px;
            text-align: center;
          }
          .email-body {
            padding: 20px;
            background-color: #f9f9f9;
          }
          .college-info {
            background-color: white;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 20px;
          }
          .info-row {
            margin-bottom: 10px;
            border-bottom: 1px solid #f0f0f0;
            padding-bottom: 10px;
          }
          .info-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
          }
          .label {
            font-weight: bold;
            color: #555;
          }
          .value {
            color: #333;
          }
          .action-buttons {
            display: table;
            width: 100%;
            margin: 20px 0;
            table-layout: fixed;
          }
          .button-cell {
            display: table-cell;
            padding: 10px;
            text-align: center;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            cursor: pointer;
            text-align: center;
          }
          .verify-button {
            background-color: #4CAF50;
            color: white;
          }
          .reject-button {
            background-color: #F44336;
            color: white;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #777;
            padding: 20px;
            border-top: 1px solid #e0e0e0;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <h2>New College Verification Request</h2>
            <p>Submitted on ${currentDate}</p>
          </div>
          
          <div class="email-body">
            <p>A new college has requested verification on your platform. Please review the details below:</p>
            
            <div class="college-info">
              <div class="info-row">
                <div class="label">College Name:</div>
                <div class="value">${name}</div>
              </div>
              <div class="info-row">
                <div class="label">Domain:</div>
                <div class="value">${domain}</div>
              </div>
              <div class="info-row">
                <div class="label">Admin Position:</div>
                <div class="value">${adminPost}</div>
              </div>
              <div class="info-row">
                <div class="label">Website:</div>
                <div class="value"><a href="${website}" target="_blank">${website}</a></div>
              </div>
              <div class="info-row">
                <div class="label">Contact Email:</div>
                <div class="value">${contactEmail}</div>
              </div>
              <div class="info-row">
                <div class="label">Contact Phone:</div>
                <div class="value">${contactPhone}</div>
              </div>
              <div class="info-row">
                <div class="label">Address:</div>
                <div class="value">${formattedAddress}</div>
              </div>
              <div class="info-row">
                <div class="label">College Code:</div>
                <div class="value">${code}</div>
              </div>
            </div>
            
            <p>Please verify or reject this college request:</p>
            
            <div class="action-buttons">
              <div class="button-cell">
                <a href="${SERVER_URL}/api/college/verification/${code}/verify" class="button verify-button">VERIFY</a>
              </div>
              <div class="button-cell">
                <a href="${SERVER_URL}/api/college/verification/${code}/reject" class="button reject-button">REJECT</a>
              </div>
            </div>
            
            <p>If the buttons above don't work, you can use these links:</p>
            <p>Verify: <a href="${SERVER_URL}/api/college/verification/${code}/verify">${SERVER_URL}/api/college/verification/${code}/verify</a></p>
            <p>Reject: <a href="${SERVER_URL}/api/college/verification/${code}/reject">${SERVER_URL}/api/college/verification/${code}/reject</a></p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} MessEase. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
};

export const createCollegeMailOptions = (
  email,
  name,
  currentDate,
  domain,
  adminPost,
  website,
  contactEmail,
  contactPhone,
  formattedAddress,
  code
) => {
  const template = generateCollegeVerificationEmail(
    name,
    currentDate,
    domain,
    adminPost,
    website,
    contactEmail,
    contactPhone,
    formattedAddress,
    code
  );

  return {
    from: process.env.EMAIL_USER,
    to: email,
    subject: template.subject,
    html: template.html,
  };
};
