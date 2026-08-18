import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set in the environment');
}

const resend = new Resend(RESEND_API_KEY);

const RESET_LINK_BASE_URL = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const resetUrl = `${RESET_LINK_BASE_URL}/reset-password?token=${encodeURIComponent(token)}`;

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to,
    subject: 'Reset your Spendexa password',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1c1917;">
        <h1 style="font-size: 18px; margin: 0 0 16px;">Reset your password</h1>
        <p style="font-size: 14px; line-height: 1.6; color: #57534e;">
          We received a request to reset the password for your Spendexa account. This link expires in 15 minutes.
        </p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: #d97706; color: #ffffff; font-weight: 600; font-size: 14px; padding: 10px 20px; border-radius: 8px; text-decoration: none;">
            Reset password
          </a>
        </p>
        <p style="font-size: 12px; line-height: 1.6; color: #78716c;">
          If you didn't request this, you can safely ignore this email -- your password won't be changed.
        </p>
        <p style="font-size: 12px; color: #a8a29e; word-break: break-all;">
          Or paste this link into your browser: ${resetUrl}
        </p>
      </div>
    `,
  });
}
