export const metadata = {
  title: 'About Us | Bakalia News',
  description: 'Learn about Bakalia News, our mission, and our team.',
  alternates: {
    canonical: 'https://bakalia.xyz/about',
  },
  openGraph: {
    title: 'About Us - Bangladesh News (Bakalia News)',
    description: 'Learn about Bakalia News (bakalia.xyz) - An independent digital news platform in Bangladesh.',
    url: 'https://bakalia.xyz/about',
    type: 'website',
  }
};

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 border-b pb-4 border-gray-200 dark:border-gray-700">আমাদের সম্পর্কে</h1>

      <div className="space-y-8 text-gray-800 dark:text-gray-200 leading-relaxed">

        <section>
          <p className="text-lg">
            <strong>Bakalia News (bakalia.xyz)</strong> হলো বাংলাদেশের একটি স্বাধীন, ডিজিটাল সংবাদমাধ্যম, যা সমসাময়িক বাংলাদেশ ও বিশ্বের গুরুত্বপূর্ণ সংবাদ দ্রুত, নির্ভুল এবং দায়িত্বশীলভাবে পাঠকের কাছে পৌঁছে দিতে প্রতিশ্রুতিবদ্ধ।
          </p>
          <p className="mt-4">
            আমাদের সংবাদকক্ষ আধুনিক প্রযুক্তি ও মানবসম্পাদনার সমন্বয়ে পরিচালিত। আধুনিক প্রযুক্তি ও অটোমেশন আমরা তথ্য সংগ্রহ, ট্রেন্ড বিশ্লেষণ এবং প্রাথমিক খসড়া তৈরিতে সহায়তা নিতে ব্যবহার করি; তবে প্রতিটি সংবাদ প্রকাশের আগে মানব সম্পাদক দ্বারা যাচাই, সম্পাদনা ও সত্যতা নিশ্চিত করা হয়।
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-green-700 dark:text-green-500">আমাদের লক্ষ্য</h2>
          <p>
            সঠিক তথ্য, প্রাসঙ্গিক বিশ্লেষণ এবং সময়োপযোগী সংবাদ পরিবেশনের মাধ্যমে পাঠকের আস্থা অর্জন করা—এই হলো আমাদের মূল লক্ষ্য।
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-green-700 dark:text-green-500">আমরা যে বিষয়গুলো কভার করি</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 list-none">
            <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>বাংলাদেশ</li>
            <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>রাজনীতি</li>
            <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>আন্তর্জাতিক</li>
            <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>ব্যবসা ও অর্থনীতি</li>
            <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>খেলাধুলা</li>
            <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>বিনোদন</li>
            <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>প্রযুক্তি ও জীবনধারা</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-green-700 dark:text-green-500">সম্পাদকীয় নীতি</h2>
          <p>
            <strong>Bakalia News</strong> নিরপেক্ষতা, তথ্যের সত্যতা এবং নৈতিক সাংবাদিকতার নীতিমালা অনুসরণ করে। কোনো সংবাদ প্রকাশের আগে আমরা একাধিক বিশ্বস্ত সূত্র যাচাই করি। ভুল তথ্য সংশোধনে আমরা প্রতিশ্রুতিবদ্ধ এবং প্রয়োজনে আপডেট বা সংশোধনী প্রকাশ করি।
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-green-700 dark:text-green-500">প্রযুক্তি ও স্বচ্ছতা</h2>
          <p>
            আমরা আধুনিক ওয়েব প্রযুক্তি, ডেটা অটোমেশন এবং AI-assisted tools ব্যবহার করি, তবে চূড়ান্ত সিদ্ধান্ত ও প্রকাশ সম্পূর্ণভাবে মানব সম্পাদকীয় নিয়ন্ত্রণে থাকে।
          </p>
        </section>

        <section className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 text-green-700 dark:text-green-500">যোগাযোগ</h2>
          <p className="mb-2">
            📧 ইমেইল: <a href="mailto:editor@bakalia.xyz" className="text-blue-600 hover:underline">editor@bakalia.xyz</a>
          </p>
          <p>
            🌐 ওয়েবসাইট: <a href="https://bakalia.xyz" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://bakalia.xyz</a>
          </p>
        </section>

      </div>
    </main>
  );
}