import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Bangladesh News",
  description: "Automated AI News Portal for Bangladesh",
};

// এখানে খেয়াল করো, কোনো : ReactNode লেখা নেই, একদম ক্লিন কোড
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}