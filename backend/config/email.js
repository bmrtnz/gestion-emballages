const nodemailer = require('nodemailer');

/**
 * Email configuration for different environments
 * Development: Uses MailCatcher for local development
 * Production: Uses external email service (Gmail, SendGrid, etc.)
 */
const getEmailConfig = () => {
  if (process.env.NODE_ENV === 'development') {
    // MailCatcher configuration for development
    return {
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '1025'),
      secure: false, // No SSL for MailCatcher
      ignoreTLS: true,
      auth: false // No authentication for MailCatcher
    };
  } else {
    // Production email service configuration
    return {
      service: process.env.EMAIL_SERVICE || 'gmail',
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    };
  }
};

// Create transporter
const transporter = nodemailer.createTransporter(getEmailConfig());

// Verify connection on startup (skip for MailCatcher in development)
if (process.env.NODE_ENV !== 'development') {
  transporter.verify((error, success) => {
    if (error) {
      console.error('Email service configuration error:', error);
    } else {
      console.log('Email service ready to send messages');
    }
  });
} else {
  console.log('Email service configured for MailCatcher (development)');
}

module.exports = transporter;