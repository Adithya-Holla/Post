/**
 * Mailer utility
 * - Uses SMTP via nodemailer when configured
 * - In test, captures last email for assertions
 */

import nodemailer from 'nodemailer';

export const mailerTestState = {
  last: null
};

const sendViaResend = async ({ to, from, subject, text }) => {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('RESEND_API_KEY not configured');
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      text
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || data?.error?.message || `HTTP ${res.status}`;
    const err = new Error(`Resend error: ${msg}`);
    err.status = res.status;
    throw err;
  }

  return data;
};

const createSmtpTransport = ({ host, port, user, pass }) => {
  const secure = port === 465 || String(process.env.SMTP_SECURE || '').trim().toLowerCase() === 'true';

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    // Prevent the request from hanging for too long if SMTP is blocked/misconfigured.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000
  });
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

  const preferResend = Boolean((process.env.RESEND_API_KEY || '').trim());

  const greeting = username ? `Hi ${username},` : 'Hi,';
  const subject = 'Reset your password';
  const text = `${greeting}\n\nReset your password using this link:\n${resetUrl}\n\nThis link expires in 15 minutes.\n\nIf you didn’t request this, you can ignore this email.`;

  // Prefer HTTPS-based provider if configured (works even when outbound SMTP is blocked by host).
  if (preferResend) {
    try {
      const data = await sendViaResend({ to, from, subject, text });
      console.log(`[password-reset] Email sent via Resend to ${to}. id=${data?.id || 'n/a'}`);
      return;
    } catch (err) {
      console.error(`[password-reset] Resend send failed for ${to}:`, err);
      // Fall through to SMTP attempt if SMTP is configured.
    }
  }

  // If SMTP isn't configured, log the URL so deployments still work.
  if (!host || !user || !pass) {
    console.warn(
      `[password-reset] Email provider not configured. Set RESEND_API_KEY (recommended) or SMTP_* vars. Reset URL for ${to}: ${resetUrl}`
    );
    return;
  }

  try {
    const transporter = createSmtpTransport({ host, port, user, pass });
    const info = await transporter.sendMail({ from, to, subject, text });
    console.log(`[password-reset] Email queued/sent via SMTP to ${to}. id=${info?.messageId || 'n/a'}`);
  } catch (err) {
    // If the host blocks outbound SMTP on 587, retry on 465.
    const code = err?.code;
    if ((code === 'ETIMEDOUT' || code === 'ECONNECTION' || code === 'ECONNREFUSED') && port === 587) {
      try {
        const transporter465 = createSmtpTransport({ host, port: 465, user, pass });
        const info2 = await transporter465.sendMail({ from, to, subject, text });
        console.log(`[password-reset] Email queued/sent via SMTP(465) to ${to}. id=${info2?.messageId || 'n/a'}`);
        return;
      } catch (err2) {
        console.error(`[password-reset] SMTP(465) retry failed for ${to}:`, err2);
      }
    }

    console.error(`[password-reset] Failed sending email to ${to}:`, err);
    throw err;
  }
};
