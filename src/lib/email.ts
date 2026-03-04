import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendVerificationEmail(
    email: string,
    token: string,
    name: string
): Promise<void> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verifyUrl = `${appUrl}/api/auth/verify-email?token=${token}`;

    await transporter.sendMail({
        from: `"ApplyPilot" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Verify your ApplyPilot account',
        html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #0f172a; font-size: 24px; margin: 0;">Welcome to ApplyPilot!</h1>
        </div>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
          Hi ${name},
        </p>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
          Thanks for signing up! Please verify your email address to activate your account.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verifyUrl}" 
             style="display: inline-block; background: linear-gradient(135deg, #0891b2, #00d4ff); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
          This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          ApplyPilot — AI-Powered Job Application Automation
        </p>
      </div>
    `,
    });
}

export async function sendPaymentConfirmationEmail(
    email: string,
    name: string,
    plan: string,
    amount: string
): Promise<void> {
    await transporter.sendMail({
        from: `"ApplyPilot" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
        to: email,
        subject: `Payment Confirmed — ${plan} Plan Activated`,
        html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #0f172a; font-size: 24px; margin: 0;">Payment Confirmed! 🎉</h1>
        </div>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
          Hi ${name},
        </p>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
          Your <strong>${plan}</strong> plan has been activated. Amount paid: <strong>${amount}</strong>.
        </p>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
          You now have full access to all features in your plan. Head to your dashboard to get started!
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" 
             style="display: inline-block; background: linear-gradient(135deg, #0891b2, #00d4ff); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
            Go to Dashboard
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          ApplyPilot — AI-Powered Job Application Automation
        </p>
      </div>
    `,
    });
}
