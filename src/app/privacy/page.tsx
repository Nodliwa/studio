
import PageHeader from '@/components/page-header';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-secondary">
      <div className="bg-background shadow-2xl min-h-full container mx-auto flex flex-col">
        <PageHeader />
        <main className="container mx-auto px-4 flex-grow my-16">
          <article className="prose lg:prose-xl max-w-none mx-auto">
            <h1 className="text-4xl font-bold font-headline mb-8">Privacy Policy</h1>
            
            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">Introduction</h2>
            <p>
              Welcome to SimpliPlan. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
            </p>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">Collection of Your Information</h2>
            <p>
              We may collect information about you in a variety of ways. The information we may collect via the Application includes:
            </p>
            <ul>
              <li>
                <strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, that you voluntarily give to us when you register with the Application.
              </li>
              <li>
                <strong>Financial Data:</strong> Data related to your celebration plans and budgets that you input into the application. We store this data to provide our services to you, but we do not share this financial data with any third parties.
              </li>
            </ul>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">Use of Your Information</h2>
            <p>
              Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:
            </p>
            <ul>
              <li>Create and manage your account.</li>
              <li>Email you regarding your account.</li>
              <li>Enable user-to-user communications.</li>
              <li>Manage your celebration plans and budgets.</li>
            </ul>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">Security of Your Information</h2>
            <p>
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
            </p>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-4">Contact Us</h2>
            <p>
              If you have questions or comments about this Privacy Policy, please contact us at: hello@simpliplan.co.za
            </p>
          </article>
        </main>
      </div>
    </div>
  );
}
