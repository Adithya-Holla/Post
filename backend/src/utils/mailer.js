/**
 * Mailer utility
 * - Uses SMTP via nodemailer when configured
 * - In test, captures last email for assertions
 */

import nodemailer from 'nodemailer';

export const mailerTestState = {
  last: null
};

export const sendPasswordResetEmail = async ({ to, username, resetUrl }) => {
  mailerTestState.last = { to, username, resetUrl };

  if (process.env.NODE_ENV === 'test') {
    return;
  }

  const host = (process.env.SMTP_HOST || '').trim();
  const user = (process.env.SMTP_USER || '').trim();
  // Gmail app passwords are often copied with spaces; nodemailer expects the raw 16-char password.
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
  const port = process.env.SMTP_PORT ? Number(String(process.env.SMTP_PORT).trim()) : 587;
  const from = (process.env.MAIL_FROM || user || '').trim();

  // If SMTP isn't configured, log the URL so dev deployments still work.
  if (!host || !user || !pass) {
    console.warn(
      `[password-reset] SMTP not configured. Reset URL for ${to}: ${resetUrl}`
    );
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    },
    // Prevent the request from hanging for too long if SMTP is blocked/misconfigured.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000
  });

  const greeting = username ? `Hi ${username},` : 'Hi,';

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: 'Reset your password',
      text: `${greeting}\n\nReset your password using this link:\n${resetUrl}\n\nThis link expires in 15 minutes.\n\nIf you didn’t request this, you can ignore this email.`
    });

    console.log(`[password-reset] Email queued/sent to ${to}. id=${info?.messageId || 'n/a'}`);
  } catch (err) {
    console.error(`[password-reset] Failed sending email to ${to}:`, err);
    throw err;
  }
};
