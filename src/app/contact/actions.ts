
'use server';

import { z } from 'zod';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_RPtpMhT1_HiiCL3NCwpn1GrGL7GLvHpEF');

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
  const fromEmail = 'hello@simpliplan.co.za';
  const toEmail = process.env.SMTP_TO_EMAIL || 'hello@simpliplan.africa';

  try {
    const { error } = await resend.emails.send({
      from: `SimpliPlan Contact <${fromEmail}>`,
      to: [toEmail],
      replyTo: email,
      subject: `New message from ${name} via SimpliPlan`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h1 style="color: #00A693;">New Contact Form Submission</h1>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 5px;">${message}</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend contact error:', error);
      return {
        success: false,
        message: 'Could not send your message. Please try again later or contact us directly.',
      };
    }

    return {
      success: true,
      message: 'Thank you for your message! We will get back to you soon.',
    };

  } catch (error) {
    console.error('Failed to process contact form:', error);
    return {
      success: false,
      message: 'There was an error sending your message. Please try again later.',
    };
  }
}
