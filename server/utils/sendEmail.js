const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// The "from" address must be a domain you've verified in Resend.
// During development you can use: onboarding@resend.dev (limited to your own email).
const FROM_ADDRESS = process.env.EMAIL_FROM || "AI Trip Planner <onboarding@resend.dev>";

/**
 * Sends the email verification link.
 */
const sendVerifyEmail = async (toEmail, name, verifyToken) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: [toEmail],
    subject: "Verify your email — AI Trip Planner",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #f8fafc;">
        <div style="background: linear-gradient(135deg, #0F172A, #0D9488); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">✈️ AI Trip Planner</h1>
          <p style="color: #99f6e4; margin-top: 8px;">Your journeys, planned by AI</p>
        </div>
        <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          <h2 style="color: #0F172A; margin-bottom: 8px;">Welcome, ${name}! 👋</h2>
          <p style="color: #64748b; line-height: 1.6;">
            Thank you for joining AI Trip Planner. Please verify your email address to start planning amazing trips.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verifyUrl}" style="background: linear-gradient(135deg, #0D9488, #0891b2); color: white; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600; font-size: 16px; display: inline-block;">
              ✅ Verify My Email
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 14px; text-align: center;">
            This link expires in 24 hours. If you didn't create an account, ignore this email.
          </p>
        </div>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend failed to send verification email: ${error.message}`);
  }
};

/**
 * Sends the password reset link.
 */
const sendResetPasswordEmail = async (toEmail, name, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: [toEmail],
    subject: "Reset your password — AI Trip Planner",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #f8fafc;">
        <div style="background: linear-gradient(135deg, #0F172A, #0D9488); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">✈️ AI Trip Planner</h1>
        </div>
        <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          <h2 style="color: #0F172A;">Reset Your Password</h2>
          <p style="color: #64748b; line-height: 1.6;">
            Hi ${name}, we received a request to reset your password. Click below to set a new password:
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #F59E0B, #f97316); color: white; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600; font-size: 16px; display: inline-block;">
              🔐 Reset Password
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 14px; text-align: center;">
            This link expires in 1 hour. If you didn't request this, ignore this email.
          </p>
        </div>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend failed to send password reset email: ${error.message}`);
  }
};

module.exports = { sendVerifyEmail, sendResetPasswordEmail };
