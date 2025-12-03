import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Bangladesh News",
  description: "Automated AI News Portal",
  // আপডেট: গুগল ভেরিফিকেশন কোড এখানে বসানো হয়েছে
  verification: {
    google: "google7c1cc9d9a077a42e",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* মেটাডাটা API অটোমেটিক ভেরিফিকেশন ট্যাগ তৈরি করবে */}
      </head>
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