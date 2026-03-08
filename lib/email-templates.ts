export interface EmailTemplateProps {
  title: string
  description: string
  content: string
}

export const getBaseTemplate = ({ title, description, content }: EmailTemplateProps) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f7f9;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: #2563eb;
      color: #ffffff;
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
    }
    .header p {
      margin: 10px 0 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .footer {
      background: #f9fafb;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer-links {
      margin-top: 10px;
    }
    .footer-links a {
      color: #2563eb;
      text-decoration: none;
      margin: 0 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
      <p>${description}</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Lead Intake Portal. All rights reserved.</p>
      <p>123 Business Avenue, Suite 100, Tech City, TC 12345</p>
      <div class="footer-links">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="#">Unsubscribe</a>
      </div>
    </div>
  </div>
</body>
</html>
`

export const getVerificationEmail = (name: string, verificationLink: string) => {
  return getBaseTemplate({
    title: 'Verify Your Email',
    description: 'Welcome to Lead Intake Portal! Please verify your account to get started.',
    content: `
      <p>Hi ${name},</p>
      <p>Thanks for signing up! We're excited to have you on board. To complete your registration and start using the platform, please verify your email address by clicking the button below:</p>
      <a href="${verificationLink}" class="button">Verify Email Address</a>
      <p>If the button above doesn't work, you can also copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #2563eb;">${verificationLink}</p>
      <p>This link will expire in 24 hours.</p>
      <p>Best regards,<br>The Lead Intake Team</p>
    `
  })
}

export const getWelcomeEmail = (name: string) => {
  return getBaseTemplate({
    title: 'Welcome to Lead Intake!',
    description: "You're all set! Let's help you manage your leads more effectively.",
    content: `
      <p>Hi ${name},</p>
      <p>Welcome to the Lead Intake Portal! This is your central hub for managing your business's lead intake and automation.</p>
      <p>Here are a few things you can do to get started:</p>
      <ul>
        <li><strong>Dashboard Overview</strong>: See all your latest submissions at a glance.</li>
        <li><strong>Notification Settings</strong>: Customize how and when you want to be notified.</li>
        <li><strong>Profile Setup</strong>: Complete your profile to personalize your experience.</li>
      </ul>
      <p>If you have any questions, our support team is always here to help.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Go to Dashboard</a>
      <p>Happy lead hunting!<br>The Lead Intake Team</p>
    `
  })
}

export const getNewDeviceEmail = (name: string, browser: string, os: string, time: string, location: string) => {
  return getBaseTemplate({
    title: 'New Login Detected',
    description: 'We noticed a new login to your Lead Intake Portal account.',
    content: `
      <p>Hi ${name},</p>
      <p>Your account was just accessed from a new device or location. If this was you, there is nothing you need to do.</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0 0 5px 0;"><strong>Device/Browser:</strong> ${browser} on ${os}</p>
        <p style="margin: 0 0 5px 0;"><strong>Location (IP):</strong> ${location}</p>
        <p style="margin: 0;"><strong>Time:</strong> ${time}</p>
      </div>
      <p>If you did not authorize this login, please reset your password immediately and contact support.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/forgot-password" class="button" style="background-color: #ef4444;">Reset Password</a>
      <p>Stay Safe,<br>The Lead Intake Security Team</p>
    `
  })
}
