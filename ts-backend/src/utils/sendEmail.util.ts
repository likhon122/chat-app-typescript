import nodemailer from 'nodemailer';
import { envConfig } from '../config/environment.config.js';

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string;
}

/**
 * Utility to send emails
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Assuming gmail, modify if different provider
      auth: {
        user: envConfig.SMTP_USERNAME,
        pass: envConfig.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: envConfig.SMTP_USERNAME,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email: ', error);
    throw new Error('Failed to send email. Please try again later.');
  }
};
