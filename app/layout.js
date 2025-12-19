import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import CookieConsent from "./components/CookieConsent";
import AnalyticsTracker from "./components/AnalyticsTracker";
import NotificationManager from "./components/NotificationManager";
import { generateOrganizationSchema } from "./lib/schemas";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL('https://bakalia.xyz'),
  alternates: { canonical: './' },
  title: { template: '%s | বাকলিয়া নিউজ', default: 'বাকলিয়া নিউজ | সর্বশেষ বাংলা খবর ও ব্রেকিং নিউজ আপডেট' },
  description: "বাংলাদেশ ও বিশ্বের সর্বশেষ বাংলা খবর, রাজনীতি, খেলাধুলা, বিনোদন ও লাইভ আপডেট পড়ুন বাকলিয়া নিউজে। সত্য ও বস্তুনিষ্ঠ সংবাদের বিশ্বস্ত অনলাইন ঠিকানা।",
  verification: { google: "fSzBPa1r8RzGTT3hcA5DFQYPiODOYlJ-rmGPOY_8qZk" },
  manifest: '/manifest.json',
  icons: {
    icon: '/bn-icon.png',
    shortcut: '/bn-icon.png',
    apple: '/bn-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BD News',
  },
  formatDetection: {
    telephone: false,
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
      <body className={`${inter.className} flex flex-col min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var localTheme = localStorage.getItem('theme');
                  var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches === true;
                  if (localTheme === 'dark' || (!localTheme && supportDarkMode)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* GTM NoScript */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GT-K4CXW423"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        {/* ... inside RootLayout */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOrganizationSchema())
          }}
        />

        {/* Google Tag Manager (GTM) */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GT-K4CXW423');
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
            <NotificationManager />
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

