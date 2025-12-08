import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
// ১. কুকি কনসেন্ট ইম্পোর্ট করা হলো
import CookieConsent from "./components/CookieConsent";
import AnalyticsTracker from "./components/AnalyticsTracker";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL('https://bakalia.xyz'),
  alternates: { canonical: './' },
  title: { template: '%s | Bangladesh News', default: 'Bangladesh News - Latest Breaking News BD' },
  description: "Automated AI News Portal providing latest breaking news, sports, politics, and technology updates 24/7.",
  verification: { google: "fSzBPa1r8RzGTT3hcA5DFQYPiODOYlJ-rmGPOY_8qZk" },
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'bn_BD',
    url: 'https://bakalia.xyz',
    siteName: 'Bangladesh News'
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen text-slate-900 dark:text-white transition-colors duration-300`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Bangladesh News",
              "url": "https://bakalia.xyz",
              "logo": "https://bakalia.xyz/icon.png",
              "sameAs": [
                "https://www.facebook.com/bangladeshnews",
                "https://twitter.com/bangladeshnews"
              ]
            })
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

        <ThemeProvider>
          <AuthProvider>
            <Header />
            <div className="flex-grow">
              {children}
            </div>
            <Footer />

            {/* ২. কুকি পপ-আপটি এখানে বসানো হলো */}
            <CookieConsent />
            <AnalyticsTracker />
          </AuthProvider>
        </ThemeProvider>

        {/* Microsoft Clarity (Paste ID below) */}
        <script dangerouslySetInnerHTML={{
          __html: `
                (function(c,l,a,r,i,t,y){
                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "YOUR_CLARITY_ID_HERE");
            `
        }} />

      </body>
    </html>
  );
}