export default function PrivacyPage() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6 sm:px-12 prose prose-gray prose-lg">
        <p className="text-slate-500 text-sm font-medium tracking-widest uppercase not-prose">LEGAL</p>
        <h1 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight mt-2 mb-8">Privacy Policy</h1>
        
        <p className="text-gray-500 text-sm mb-8">Last updated: March 15, 2026</p>

        <h2>1. Information We Collect</h2>
        <p>
          When you create an account on VSTEP Writing Lab, we collect your name, email address, and password. 
          When you use our service, we collect your essay submissions and AI-generated feedback for the purpose of 
          providing our writing analysis service and tracking your progress.
        </p>

        <h2>2. How We Use Your Information</h2>
        <p>
          We use your information to provide, maintain, and improve our services, including generating AI-powered 
          writing feedback, tracking your progress, and personalizing your learning experience. We do not sell your 
          personal information to third parties.
        </p>

        <h2>3. Data Storage & Security</h2>
        <p>
          Your data is securely stored on Firebase infrastructure with encryption at rest and in transit. 
          Essay submissions are processed through Google&apos;s Gemini AI API and are not retained by the AI provider 
          beyond the processing window.
        </p>

        <h2>4. Your Rights</h2>
        <p>
          You have the right to access, correct, or delete your personal data at any time. You may also request 
          a copy of all data we hold about you. To exercise these rights, please contact us at 
          support@vstepwriting.edu.vn.
        </p>

        <h2>5. Cookies</h2>
        <p>
          We use essential cookies to maintain your login session and preferences. We do not use third-party 
          tracking cookies or advertising cookies.
        </p>

        <h2>6. Contact</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at support@vstepwriting.edu.vn 
          or visit our Contact page.
        </p>
      </div>
    </section>
  );
}
