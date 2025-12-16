
import PageHeader from '@/components/page-header';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-secondary">
      <div className="bg-background shadow-2xl min-h-full container mx-auto flex flex-col">
        <PageHeader />
        <main className="container mx-auto px-4 flex-grow my-16">
          <article className="prose lg:prose-xl max-w-none mx-auto">
            <h1 className="text-4xl font-bold font-headline mb-8">SimpliPlan Privacy Policy</h1>
            <p className='lead'>Last updated: 30 November 2025</p>

            <p className="text-justify">
              SimpliPlan ("we", "us", "our") is a South African digital planning and budgeting platform designed to help users plan events, including funeral and celebration planning. We are committed to protecting your personal information and complying with the Protection of Personal Information Act, 4 of 2013 (POPIA) and other applicable data protection laws. By using SimpliPlan, you agree to the collection and use of information in accordance with this Privacy Policy.
            </p>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">1. Who We Are</h2>
            <p className="text-justify"><strong>Responsible Party:</strong> SimpliPlan</p>
            <p className="text-justify"><strong>Country:</strong> South Africa</p>
            <p className="text-justify"><strong>Contact Email:</strong> privacy@simpliplan.co.za</p>
            <p className="text-justify">SimpliPlan is the responsible party for personal information processed through the SimpliPlan website and application.</p>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">2. Information We Collect</h2>
            <p className="text-justify">We collect only information that is necessary to provide and improve our services.</p>
            <h3 className="font-bold">2.1. Personal Information</h3>
            <ul>
              <li>Full name</li>
              <li>Email address</li>
              <li>Contact number</li>
              <li>Login credentials (encrypted)</li>
            </ul>

            <h3 className="font-bold">2.2. Event & Planning Information</h3>
            <ul>
              <li>Event name and type</li>
              <li>Event date and location</li>
              <li>Expected number of guests</li>
              <li>Budget categories, items, quantities, and prices</li>
              <li>Funeral-related planning information (non-medical)</li>
            </ul>

            <h3 className="font-bold">2.3. Location Information</h3>
            <p className="text-justify">We use Google Places Autocomplete to help users select event locations. We do not store precise GPS location data unless entered by the user.</p>

            <h3 className="font-bold">2.4. Technical Information</h3>
            <ul>
              <li>IP address</li>
              <li>Device and browser type</li>
              <li>Usage data (pages visited, features used)</li>
            </ul>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">3. How We Use Your Information</h2>
            <p className="text-justify">We use your information to:</p>
            <ul>
              <li>Create and manage user accounts</li>
              <li>Save and manage budgets and plans</li>
              <li>Calculate totals and generate quotes</li>
              <li>Improve app performance and usability</li>
              <li>Communicate important service-related messages</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p className="text-justify">We do not sell your personal information.</p>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">4. Legal Basis for Processing (POPIA)</h2>
            <p className="text-justify">We process personal information based on:</p>
            <ul>
              <li>Your consent</li>
              <li>Performance of a contract (providing the SimpliPlan service)</li>
              <li>Legal obligations</li>
              <li>Legitimate business interests that do not override your rights</li>
            </ul>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">5. Data Storage and Security</h2>
            <p className="text-justify">We take reasonable technical and organisational measures to protect your information.</p>
            <ul>
              <li>Data is stored securely using Firebase (Google Cloud)</li>
              <li>Encryption is used in transit and at rest where applicable</li>
              <li>Access is restricted to authorised personnel only</li>
            </ul>
            <p className="text-justify">Despite safeguards, no system is 100% secure.</p>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">6. Third-Party Service Providers</h2>
            <p className="text-justify">We use trusted third-party services to operate SimpliPlan:</p>
            <ul>
              <li>Google Firebase – authentication, database, and hosting</li>
              <li>Google Maps & Places API – address autocomplete</li>
              <li>Facebook Login & X (Twitter) Login - for authentication</li>
            </ul>
            <p className="text-justify">These providers process data in accordance with their own privacy policies and applicable laws.</p>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">7. International Data Transfers</h2>
            <p className="text-justify">Some service providers may process data outside South Africa. Where this occurs, we ensure appropriate safeguards are in place as required by POPIA.</p>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">8. Data Retention</h2>
            <p className="text-justify">We retain personal information only for as long as necessary:</p>
            <ul>
              <li>While your account remains active</li>
              <li>As required for legal or operational purposes</li>
            </ul>
            <p className="text-justify">You may request deletion of your account and associated data at any time.</p>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">9. Your Rights</h2>
            <p className="text-justify">Under POPIA, you have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Request correction or deletion</li>
              <li>Object to processing</li>
              <li>Withdraw consent (where applicable)</li>
              <li>Lodge a complaint with the Information Regulator</li>
            </ul>
            <p className="text-justify">To exercise your rights, contact us at <a href="mailto:privacy@simpliplan.co.za">privacy@simpliplan.co.za</a>.</p>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">10. Managing & Deleting Your Data</h2>
            <p className="text-justify">
              You are in control of your personal information. You can delete your account and all associated data at any time. To request data deletion, please send an email with the subject line "Data Deletion Request" to <a href="mailto:support@simpliplan.co.za">support@simpliplan.co.za</a> from the email address associated with your SimpliPlan account. We will process your request within a reasonable timeframe in accordance with applicable laws.
            </p>
            <p className="text-justify">
              When you configure your Facebook App, you can provide the following URL as your <strong>Data Deletion Instructions URL</strong>: <a href="https://studio-1406892914-3d877.firebaseapp.com/privacy">https://studio-1406892914-3d877.firebaseapp.com/privacy</a>
            </p>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">11. Cookies & Analytics</h2>
            <p className="text-justify">SimpliPlan uses essential cookies and similar technologies to:</p>
            <ul>
              <li>Maintain login sessions</li>
              <li>Improve functionality</li>
            </ul>
            <p className="text-justify">We do not use cookies for third-party advertising.</p>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">12. Children’s Information</h2>
            <p className="text-justify">SimpliPlan is not intended for children under the age of 18. We do not knowingly collect personal information from children.</p>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">13. Changes to This Policy</h2>
            <p className="text-justify">We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date.</p>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">14. Contact Us</h2>
            <p className="text-justify">If you have any questions or concerns about this Privacy Policy or how we handle your information, contact:</p>
            <p>Email: <a href="mailto:privacy@simpliplan.co.za">privacy@simpliplan.co.za</a></p>
            <br/>
            <p><strong>By using SimpliPlan, you acknowledge that you have read and understood this Privacy Policy.</strong></p>
          </article>
        </main>
      </div>
    </div>
  );
}
