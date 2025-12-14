
import PageHeader from '@/components/page-header';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-secondary">
      <div className="bg-background shadow-2xl min-h-full container mx-auto flex flex-col">
        <PageHeader />
        <main className="container mx-auto px-4 flex-grow my-16">
          <article className="prose lg:prose-xl max-w-none mx-auto">
            <h1 className="text-4xl font-bold font-headline mb-8">SIMPLIPLAN TERMS & CONDITIONS</h1>
            <p className='lead'>Last updated: 30 November 2025</p>
            <p className="text-justify">
              These Terms and Conditions ("Terms") govern your access to and use of SimpliPlan (the "Platform", "Service", "App", or "Website"), operated in South Africa. By accessing or using SimpliPlan, you agree to be bound by these Terms. If you do not agree, you may not use the Service.
            </p>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">1. DEFINITIONS</h2>
            <ul>
              <li>"SimpliPlan" / "we" / "us" / "our" refers to the SimpliPlan platform and its operators.</li>
              <li>"User" / "you" refers to any individual who accesses or uses SimpliPlan.</li>
              <li>"Account" means a registered user profile created to access features of the Service.</li>
              <li>"Content" means any information, data, text, or materials entered into the platform by users.</li>
            </ul>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">2. ELIGIBILITY</h2>
            <p className="text-justify">
              You must be 18 years or older to create an account and use SimpliPlan. By using the Service, you confirm that you meet this requirement and have the legal capacity to enter into these Terms.
            </p>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">3. ACCOUNT REGISTRATION</h2>
            <p className="text-justify">To access core features, you must create an account. You agree to:</p>
            <ul>
              <li>Provide accurate and complete information</li>
              <li>Keep your login credentials secure</li>
              <li>Notify us immediately of any unauthorised use of your account</li>
            </ul>
            <p className="text-justify">You are responsible for all activity that occurs under your account.</p>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">4. DESCRIPTION OF THE SERVICE</h2>
            <p className="text-justify">SimpliPlan provides digital tools to:</p>
            <ul>
              <li>Plan events (including funeral and celebration planning)</li>
              <li>Create and manage budgets</li>
              <li>Capture products, services, quantities, and prices</li>
              <li>Generate totals, summaries, and quotes</li>
            </ul>
            <p className="text-justify">SimpliPlan is a planning and budgeting tool only. We do not provide funeral services, catering, transport, or any third-party services listed within user-created plans.</p>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">5. USER CONTENT AND RESPONSIBILITIES</h2>
            <p className="text-justify">You retain ownership of all content you submit to SimpliPlan. By using the Service, you grant SimpliPlan a limited licence to store, process, and display your content solely to provide the Service.</p>
            <p className="text-justify">You agree that:</p>
            <ul>
              <li>All information you enter is accurate to the best of your knowledge</li>
              <li>Pricing and totals generated are estimates only</li>
              <li>You are responsible for verifying costs with third-party service providers</li>
            </ul>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">6. FEES AND PAYMENTS</h2>
            <p className="text-justify">Unless explicitly stated, SimpliPlan does not process payments for goods or services listed in your plans.</p>
            <p className="text-justify">If paid features or subscriptions are introduced:</p>
            <ul>
              <li>Pricing will be clearly displayed</li>
              <li>Additional terms may apply</li>
            </ul>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">7. THIRD-PARTY SERVICES</h2>
            <p className="text-justify">SimpliPlan integrates with third-party services, including:</p>
            <ul>
              <li>Google Firebase (authentication, data storage)</li>
              <li>Google Maps & Places API (location autocomplete)</li>
            </ul>
            <p className="text-justify">Your use of these services is subject to their respective terms and privacy policies. SimpliPlan is not responsible for third-party services or content.</p>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">8. DATA PROTECTION AND PRIVACY</h2>
            <p className="text-justify">
              Your personal information is processed in accordance with the SimpliPlan Privacy Policy, which forms part of these Terms. By using SimpliPlan, you consent to such processing.
            </p>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">9. INTELLECTUAL PROPERTY</h2>
            <p className="text-justify">
              All intellectual property related to SimpliPlan, including branding, logos, software, and design, remains the property of SimpliPlan or its licensors.
              You may not copy, modify, distribute, or reverse-engineer any part of the platform without written permission.
            </p>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">10. ACCEPTABLE USE</h2>
            <p className="text-justify">You agree not to:</p>
            <ul>
                <li>Use the platform for unlawful purposes</li>
                <li>Upload malicious code or attempt to breach security</li>
                <li>Interfere with the operation of the Service</li>
                <li>Misrepresent SimpliPlan as a service provider or vendor</li>
            </ul>
            <p className="text-justify">We reserve the right to suspend or terminate accounts that violate these Terms.</p>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">11. DISCLAIMER</h2>
            <p className="text-justify">SimpliPlan is provided on an "as-is" and "as-available" basis. We make no warranties regarding:</p>
            <ul>
                <li>Accuracy of calculations</li>
                <li>Availability or uninterrupted access</li>
                <li>Suitability for specific purposes</li>
            </ul>
            <p className="text-justify">All planning outputs are indicative only.</p>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">12. LIMITATION OF LIABILITY</h2>
            <p className="text-justify">To the maximum extent permitted by law:</p>
            <ul>
                <li>SimpliPlan shall not be liable for indirect, incidental, or consequential damages</li>
                <li>SimpliPlan shall not be liable for losses arising from reliance on budget estimates or third-party services</li>
            </ul>
            <p className="text-justify">Your use of the platform is at your own risk.</p>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">13. TERMINATION</h2>
            <p className="text-justify">
              You may terminate your account at any time. We may suspend or terminate access if you breach these Terms or misuse the platform.
              Upon termination, your access will end and data may be deleted in accordance with our Privacy Policy.
            </p>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">14. GOVERNING LAW</h2>
            <p className="text-justify">
              These Terms are governed by the laws of the Republic of South Africa. Any disputes shall be subject to the exclusive jurisdiction of South African courts.
            </p>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">15. CHANGES TO THESE TERMS</h2>
            <p className="text-justify">
              We may update these Terms from time to time. Continued use of SimpliPlan after changes constitutes acceptance of the revised Terms.
            </p>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">16. CONTACT INFORMATION</h2>
            <p className="text-justify">If you have any questions about these Terms, contact us at:</p>
            <p>Email: <a href="mailto:support@simpliplan.africa">support@simpliplan.africa</a></p>
            <br />
            <p className="text-justify"><strong>By using SimpliPlan, you acknowledge that you have read, understood, and agree to these Terms & Conditions.</strong></p>
          </article>
        </main>
      </div>
    </div>
  );
}
