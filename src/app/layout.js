import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToastProvider from "@/components/ToastProvider";

export const metadata = {
  title: "PixelCore's Cocoir Store",
  description: "A simple e-commerce app built with Next.js 13, showcasing a variety of products and a seamless shopping experience.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}