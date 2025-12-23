'use server';

import { z } from 'zod';

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
    // This provides detailed error messages back to the client if needed.
    return {
      success: false,
      message: 'Invalid form data.',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email, message } = parsed.data;

  // --- Backend Action ---
  // In a real application, you would integrate an email service here.
  // For now, we'll log the message to the server console.
  console.log('--- New Contact Form Submission ---');
  console.log(`From: ${name} <${email}>`);
  console.log(`Message: ${message}`);
  console.log('------------------------------------');
  
  // This is where you would add your email sending logic, for example:
  // await sendEmail({ to: 'hello@simpliplan.co.za', from: email, subject: `Message from ${name}`, text: message });

  return {
    success: true,
    message: 'Thank you for your message! We will get back to you soon.',
  };
}
