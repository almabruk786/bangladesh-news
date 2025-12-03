import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header"; // হেডার ইম্পোর্ট
import Footer from "./components/Footer"; // ফুটার ইম্পোর্ট

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Bangladesh News",
  description: "Automated AI News Portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* ভবিষ্যতে AdSense কোড এখানে বসবে */}
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        
        {/* ১. হেডার (সব পেজে থাকবে) */}
        <Header />
        
        {/* ২. মেইন কন্টেন্ট (পরিবর্তনশীল অংশ) */}
        <div className="flex-grow">
          {children}
        </div>

        {/* ৩. ফুটার (সব পেজে থাকবে) */}
        <Footer />
        
      </body>
    </html>
  );
}