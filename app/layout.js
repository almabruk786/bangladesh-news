import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  // ১. বেস ইউআরএল (Issue #7 Fix: Cloudinary বা যেকোনো ইমেজের পূর্ণাঙ্গ লিংকের জন্য জরুরি)
  metadataBase: new URL('https://bakalia.xyz'),

  // ২. ক্যানোনিক্যাল ইউআরএল (Issue #5 Fix)
  alternates: {
    canonical: './', // এটি অটোমেটিক পূর্ণ লিংক তৈরি করবে
  },

  title: {
    template: '%s | Bangladesh News',
    default: 'Bangladesh News - Latest Breaking News BD',
  },
  description: "Bangladesh News is the leading automated AI news portal providing latest breaking news, sports, politics, and technology updates 24/7.",
  
  verification: {
    google: "fSzBPa1r8RzGTT3hcA5DFQYPiODOYlJ-rmGPOY_8qZk",
  },
  
  openGraph: {
    siteName: 'Bangladesh News',
    locale: 'bn_BD',
    type: 'website',
    url: 'https://bakalia.xyz',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Header />
        <div className="flex-grow">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}