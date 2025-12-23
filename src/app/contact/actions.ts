
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
  
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_EMAIL, SMTP_TO_EMAIL } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM_EMAIL || !SMTP_TO_EMAIL) {
    console.error('--- SMTP settings are missing in environment variables ---');
    console.log('--- New Contact Form Submission ---');
    console.log(`From: ${name} <${email}>`);
    console.log(`Message: ${message}`);
    console.log('------------------------------------');
    return {
      success: false,
      message: 'The server is not configured to send emails. Please contact the administrator.',
    };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT, 10),
    secure: parseInt(SMTP_PORT, 10) === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    await transporter.verify();
  } catch (error) {
    console.error('SMTP configuration error:', error);
    return {
      success: false,
      message: 'There was an error connecting to the email server. Please try again later.',
    };
  }

  try {
    await transporter.sendMail({
      from: `"${name}" <${SMTP_FROM_EMAIL}>`,
      to: SMTP_TO_EMAIL,
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
