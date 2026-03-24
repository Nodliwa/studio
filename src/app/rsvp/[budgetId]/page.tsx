
import { notFound } from 'next/navigation';

// Renamed internally to userId param to fix Next.js build conflict
export default function RSVPPage({ params: { userId } }: { params: { userId: string } }) {
  notFound();
}
