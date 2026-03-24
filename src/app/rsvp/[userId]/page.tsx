
import { notFound } from 'next/navigation';

/**
 * RSVP feature removed. 
 * Standardizing param name to 'userId' to resolve Next.js build conflict at the /rsvp path level.
 */
export default function Page({ params }: { params: { userId: string } }) {
  notFound();
}
