
import PageHeader from '@/components/page-header';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-secondary">
      <div className="bg-background shadow-2xl min-h-full container mx-auto flex flex-col">
        <PageHeader />
        <main className="container mx-auto px-4 flex-grow my-16">
          <article className="prose lg:prose-xl max-w-none mx-auto">
            <h1 className="text-4xl font-bold font-headline mb-8">Terms of Service</h1>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">1. Agreement to Terms</h2>
            <p>
              By using our application, you agree to be bound by these Terms of Service. If you do not agree to these Terms, do not use the application.
            </p>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">2. User Accounts</h2>
            <p>
              When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
            </p>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">3. Content</h2>
            <p>
              Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, or other material ("Content"). You are responsible for the Content that you post on or through the Service, including its legality, reliability, and appropriateness.
            </p>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">4. Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">5. Limitation Of Liability</h2>
            <p>
              In no event shall SimpliPlan, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at: hello@simpliplan.co.za
            </p>
          </article>
        </main>
      </div>
    </div>
  );
}
