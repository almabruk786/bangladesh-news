export const metadata = {
  title: 'Privacy Policy | গোপনীয়তা নীতি - Bakalia News',
  description: 'Privacy Policy of Bakalia News. We are committed to protecting your personal information and your right to privacy. গোপনীয়তা নীতি - বাকলিয়া নিউজ।',
  alternates: {
    canonical: 'https://bakalia.xyz/privacy-policy',
  },
};

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 font-sans text-slate-800 dark:text-slate-200">
      <div className="mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-3xl md:text-5xl font-black mb-4">Privacy Policy (গোপনীয়তা নীতি)</h1>
        <p className="text-slate-500">Last Updated: December 23, 2025</p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none">

        {/* INTRODUCTION */}
        <section className="mb-10">
          <p className="lead">
            Welcome to <strong>Bakalia News</strong> (bakalia.xyz). We respect your privacy and are committed to protecting your personal data. This privacy policy allows you to understand what data we collect, why we use it, and how we protect it. This policy applies to our website and its subdomains.
          </p>
          <p>
            <strong>বাকলিয়া নিউজ</strong>-এ আপনাকে স্বাগতম। আমরা আপনার গোপনীয়তাকে সম্মান করি এবং আপনার ব্যক্তিগত তথ্য সুরক্ষায় প্রতিশ্রুতিবদ্ধ। এই গোপনীয়তা নীতির মাধ্যমে আপনি জানতে পারবেন আমরা কী তথ্য সংগ্রহ করি এবং কীভাবে তা ব্যবহার করি।
          </p>
        </section>

        <hr className="my-8 border-slate-200 dark:border-slate-700" />

        {/* 1. INFORMATION WE COLLECT */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">1. Information We Collect (আমরা যে তথ্য সংগ্রহ করি)</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-lg">A. Personal Information (ব্যক্তিগত তথ্য)</h3>
              <p>
                We may collect personal information such as your Name, Email Address, and Profile Picture when you voluntarily subscribe to our newsletter, register, or leave a comment.
              </p>
              <p className="text-sm opacity-80">
                যখন আপনি আমাদের নিউজলেটারে সাবস্ক্রাইব করেন বা মন্তব্য করেন, তখন আমরা আপনার নাম ও ইমেইল ঠিকানা সংগ্রহ করতে পারি।
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg">B. Non-Personal Information (অ-ব্যক্তিগত তথ্য)</h3>
              <p>
                We automatically collect certain information when you visit, use, or navigate the Website. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, and information about how and when you use our Website.
              </p>
            </div>
          </div>
        </section>

        {/* 2. COOKIES & ADSENSE */}
        <section className="mb-10 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl font-bold mb-4">2. Cookies and Advertising (কুকিজ এবং বিজ্ঞাপন)</h2>
          <p className="mb-4">
            We use Google AdSense to serve ads. Google, as a third-party vendor, uses cookies to serve ads on our site.
          </p>

          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>DoubleClick DART Cookie:</strong> Google's use of the DART cookie enables it to serve ads to our users based on their visit to our site and other sites on the Internet.
            </li>
            <li>
              <strong>Opt-out:</strong> Users may opt-out of the use of the DART cookie by visiting the Google ad and content network privacy policy at <a href="https://policies.google.com/technologies/ads" target="_blank" rel="nofollow noopener" className="text-blue-600 underline">Google Ads Settings</a>.
            </li>
          </ul>

          <p className="mt-4 text-sm opacity-90">
            <strong>বিজ্ঞাপন:</strong> আমরা গুগল অ্যাডসেন্স ব্যবহার করি। গুগল তৃতীয় পক্ষ হিসেবে কুকিজ ব্যবহার করে ব্যবহারকারীর রুচি অনুযায়ী বিজ্ঞাপন প্রদর্শন করে। আপনি চাইলে গুগল অ্যাড সেটিংসে গিয়ে এটি নিয়ন্ত্রণ করতে পারেন।
          </p>
        </section>

        {/* 3. GDPR & CCPA */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">3. Data Protection Rights (GDPR & CCPA)</h2>
          <p>We would like to make sure you are fully aware of all of your data protection rights.</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><strong>The right to access</strong> – You have the right to request copies of your personal data.</li>
            <li><strong>The right to rectification</strong> – You have the right to request that we correct any information you believe is inaccurate.</li>
            <li><strong>The right to erasure</strong> – You have the right to request that we erase your personal data, under certain conditions.</li>
            <li><strong>CCPA Privacy Rights (Do Not Sell My Personal Information)</strong> – Under the CCPA, among other rights, California consumers have the right to request that a business that collects a consumer's personal data disclose the categories and specific pieces of personal data that a business has collected about consumers.</li>
          </ul>
        </section>

        {/* 4. THIRD PARTY LINKS */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">4. Third-Party Links (তৃতীয় পক্ষের লিংক)</h2>
          <p>
            Our website may contain links to other websites. We are not responsible for the privacy policies or content of those external sites.
          </p>
        </section>

        {/* 5. CONTACT */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">5. Contact Us (যোগাযোগ)</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us:
          </p>
          <ul className="mt-2 space-y-1">
            <li><strong>Email:</strong> editor@bakalia.xyz</li>
            <li><strong>Address:</strong> Karwan Bazar, Dhaka, Bangladesh.</li>
          </ul>
        </section>

      </div>
    </div>
  );
}