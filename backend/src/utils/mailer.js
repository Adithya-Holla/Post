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

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const from = process.env.MAIL_FROM || user;

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
    }
  });

  const greeting = username ? `Hi ${username},` : 'Hi,';

  await transporter.sendMail({
    from,
    to,
    subject: 'Reset your password',
    text: `${greeting}\n\nReset your password using this link:\n${resetUrl}\n\nThis link expires in 15 minutes.\n\nIf you didn’t request this, you can ignore this email.`
  });
};
