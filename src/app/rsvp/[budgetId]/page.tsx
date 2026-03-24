
import { redirect } from 'next/navigation';

/**
 * Redirects from the old [budgetId] route to the unified [userId] dynamic segment
 * to resolve Next.js routing conflicts.
 */
export default function LegacyRedirect({ params }: { params: { budgetId: string } }) {
  redirect(`/rsvp/${params.budgetId}`);
}
