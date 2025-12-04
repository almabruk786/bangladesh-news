import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { ThemeProvider } from "./context/ThemeContext";
// ১. কুকি কনসেন্ট ইম্পোর্ট করা হলো
import CookieConsent from "./components/CookieConsent"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL('https://bakalia.xyz'),
  alternates: { canonical: './' },
  title: { template: '%s | Bangladesh News', default: 'Bangladesh News - Latest Breaking News BD' },
  description: "Automated AI News Portal providing latest breaking news, sports, politics, and technology updates 24/7.",
  verification: { google: "fSzBPa1r8RzGTT3hcA5DFQYPiODOYlJ-rmGPOY_8qZk" },
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
      <body className={`${inter.className} flex flex-col min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300`}>
        
        <ThemeProvider>
          <Header />
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
          
          {/* ২. কুকি পপ-আপটি এখানে বসানো হলো */}
          <CookieConsent />
          
        </ThemeProvider>
        
      </body>
    </html>
  );
}