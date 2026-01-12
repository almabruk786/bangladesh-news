import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "./context/ThemeContext";
import ConditionalAuthWrapper from "./components/ConditionalAuthWrapper";
import { generateOrganizationSchema } from "./lib/schemas";
import { getCategories } from "./lib/firebaseServer";

import { Inter, Frank_Ruhl_Libre, Noto_Serif_Bengali } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const frankRuhlLibre = Frank_Ruhl_Libre({ subsets: ["latin"], variable: "--font-frank" });
const notoserifBengali = Noto_Serif_Bengali({ subsets: ["bengali"], variable: "--font-bengali" });

export const metadata = {
  // Ensure strict canonical
  metadataBase: new URL('https://bakalia.xyz'),
  alternates: {
    canonical: '/',
  },
  title: {
    template: '%s | বাকলিয়া নিউজ | BD All Newspaper',
    default: 'All Bangla Newspaper | বাকলিয়া নিউজ | BD News & Breaking Headlines'
  },
  description: "Latest BD News & Bangla Newspaper updates. বাকলিয়া নিউজ covers politics, sports, and entertainment 24/7 from top Bangladesh newspapers.",
  keywords: [
    "Bangla Newspaper",
    "BD News",
    "All Bangla Newspaper",
    "Bangladesh Newspaper",
    "Online Bangla Newspaper",
    "BD All Newspaper",
    "Newspaper List",
    "Bangla News 24",
    "Daily Bangla Newspaper",
    "Breaking News BD",
    "বাকলিয়া নিউজ",
    "খবর"
  ],
  verification: {
    google: "fSzBPa1r8RzGTT3hcA5DFQYPiODOYlJ-rmGPOY_8qZk",
    other: {
      "fb:pages": "914852471714207"
    }
  },
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
    siteName: 'বাকলিয়া নিউজ',
    title: 'All Bangla Newspaper | বাকলিয়া নিউজ | BD News',
    description: "Your trusted source for All Bangla Newspaper and latest BD News. Live updates on politics, sports, and more.",
    images: [
      {
        url: 'https://bakalia.xyz/bn-icon.png',
        width: 512,
        height: 512,
        alt: 'Bakalia News Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Bangla Newspaper | বাকলিয়া নিউজ',
    description: "Latest BD News & Bangla Newspaper updates. বাকলিয়া নিউজ covers politics, sports, and entertainment.",
    images: ['https://bakalia.xyz/bn-icon.png'],
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
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default async function RootLayout({ children }) {
  const categories = await getCategories();
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${frankRuhlLibre.variable} ${notoserifBengali.variable}`}>
      <body className={`${inter.className} font-sans flex flex-col min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300`}>
        {/* Manual Service Worker Registration */}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                  console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, function(err) {
                  console.log('ServiceWorker registration failed: ', err);
                });
              });
            }
          `}
        </Script>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var localTheme = localStorage.getItem('theme');
                  var supportDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches === true;
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

        {/* ✅ Google AdSense Script - Optimized for Speed */}
        <Script
          id="adsense-init"
          strategy="lazyOnload"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2257905734584691"
          crossOrigin="anonymous"
        />

        <ThemeProvider>
          <ConditionalAuthWrapper initialCategories={categories}>
            {children}
          </ConditionalAuthWrapper>
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

