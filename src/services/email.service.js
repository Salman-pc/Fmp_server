import nodemailer from 'nodemailer';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

let transporter = null;

if (config.smtpHost && config.smtpUser && config.smtpPass) {
  transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass
    }
  });
}

export const sendOtpEmail = async (toEmail, otpCode, subject = 'GeoCircle Password Reset OTP Verification') => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background-color: #0f172a; border-radius: 12px; color: #f8fafc; border: 1px solid #334155;">
      <h2 style="color: #06b6d4; text-align: center; margin-bottom: 20px;">GeoCircle Verification Code</h2>
      <p style="font-size: 14px; color: #cbd5e1;">Hello,</p>
      <p style="font-size: 14px; color: #cbd5e1;">Your 6-digit OTP verification code for account access reset is:</p>
      <div style="text-align: center; margin: 25px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #38bdf8; background-color: #1e293b; padding: 12px 24px; border-radius: 8px; border: 1px solid #0284c7; display: inline-block;">
          ${otpCode}
        </span>
      </div>
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">This code will expire in 15 minutes. If you did not request this code, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #334155; margin-top: 20px;" />
      <p style="font-size: 11px; color: #64748b; text-align: center;">GeoCircle Presence System &bull; Secure Authentication</p>
    </div>
  `;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: config.smtpFrom,
        to: toEmail,
        subject,
        html: htmlContent
      });
      logger.info(`[Nodemailer]: OTP verification email sent to ${toEmail}. Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error(`[Nodemailer Error]: Failed to send OTP email to ${toEmail}:`, error);
      // Fallback log
      logger.info(`[Fallback OTP Log]: ${toEmail} -> OTP: ${otpCode}`);
      return { success: false, error: error.message };
    }
  } else {
    logger.info(`ℹ️ [SMTP Not Configured]: OTP for ${toEmail} is [${otpCode}]`);
    return { success: true, devMode: true };
  }
};
