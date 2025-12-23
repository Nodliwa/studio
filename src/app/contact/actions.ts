
'use server';

import { z } from 'zod';
import nodemailer from 'nodemailer';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('A valid email is required'),
  message: z.string().min(1, 'Message is required'),
});

export async function submitContactForm(formData: FormData) {
  const parsed = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: 'Invalid form data.',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email, message } = parsed.data;
  
  // This line securely reads the SMTP credentials from your environment variables.
  // On your local machine, these are stored in the .env file.
  // In production, you will set these in your hosting provider's settings.
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_EMAIL, SMTP_TO_EMAIL } = process.env;

  // If any of the required SMTP variables are missing, the email will not be sent.
  // Instead, it will log the submission to the console for debugging.
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM_EMAIL || !SMTP_TO_EMAIL) {
    console.error('--- SMTP settings are missing in environment variables ---');
    console.log('--- New Contact Form Submission (Logged, Not Sent) ---');
    console.log(`From: ${name} <${email}>`);
    console.log(`Message: ${message}`);
    console.log('------------------------------------');
    return {
      success: false,
      message: 'The server is not configured to send emails. Please contact the administrator.',
    };
  }

  // This is the configuration block for Nodemailer.
  // It uses the variables loaded from your .env file.
  // You do NOT need to add your password here directly.
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT, 10),
    secure: parseInt(SMTP_PORT, 10) === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER, // Your email address from .env
      pass: SMTP_PASS, // Your email password from .env
    },
  });

  try {
    // Verify that the SMTP connection is valid
    await transporter.verify();
  } catch (error) {
    console.error('SMTP configuration error:', error);
    return {
      success: false,
      message: 'There was an error connecting to the email server. Please try again later.',
    };
  }

  try {
    // Send the email
    await transporter.sendMail({
      from: `"${name}" <${SMTP_FROM_EMAIL}>`, // Sends from the email in .env
      to: SMTP_TO_EMAIL, // Sends to the recipient email in .env
      replyTo: email,
      subject: `New message from ${name} via SimpliPlan`,
      html: `
        <h1>New Contact Form Submission</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    return {
      success: true,
      message: 'Thank you for your message! We will get back to you soon.',
    };

  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      message: 'There was an error sending your message. Please try again later.',
    };
  }
}
