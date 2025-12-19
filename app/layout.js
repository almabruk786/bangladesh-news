import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import CookieConsent from "./components/CookieConsent";
import AnalyticsTracker from "./components/AnalyticsTracker";
import { generateOrganizationSchema } from "./lib/schemas";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL('https://bakalia.xyz'),
  alternates: { canonical: './' },
  title: { template: '%s | বাকলিয়া নিউজ', default: 'বাকলিয়া নিউজ | সর্বশেষ বাংলা খবর ও ব্রেকিং নিউজ আপডেট' },
  description: "বাংলাদেশ ও বিশ্বের সর্বশেষ বাংলা খবর, রাজনীতি, খেলাধুলা, বিনোদন ও লাইভ আপডেট পড়ুন বাকলিয়া নিউজে। সত্য ও বস্তুনিষ্ঠ সংবাদের বিশ্বস্ত অনলাইন ঠিকানা।",
  verification: { google: "fSzBPa1r8RzGTT3hcA5DFQYPiODOYlJ-rmGPOY_8qZk" },
  icons: {
    icon: '/bn-icon.png',
    shortcut: '/bn-icon.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'bn_BD',
    url: 'https://bakalia.xyz',
    siteName: 'বাকলিয়া নিউজ'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen text-slate-900 dark:text-white transition-colors duration-300`}>

        {/* ... inside RootLayout */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOrganizationSchema())
          }}
        />

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-PCF88G7CBF"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-PCF88G7CBF');
          `}
        </Script>

        {/* ✅ Google AdSense Script */}
        <Script
          id="adsense-init"
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2257905734584691"
          crossOrigin="anonymous"
        />

        <ThemeProvider>
          <AuthProvider>
            <Header />
            <div className="flex-grow">
              {children}
            </div>
            <Footer />

            <CookieConsent />
            <AnalyticsTracker />
          </AuthProvider>
        </ThemeProvider>

        {/* Microsoft Clarity - Lazy Load */}
        <Script id="microsoft-clarity" strategy="lazyOnload">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "YOUR_CLARITY_ID_HERE");
          `}
        </Script>
      </body>
    </html>
  );
}

