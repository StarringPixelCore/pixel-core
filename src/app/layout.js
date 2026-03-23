import "../styles/globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ToastProvider from "@/components/providers/ToastProvider";

export const metadata = {
  title: "PixelCore's Cocoir Store",
  description:
    "A simple e-commerce app built with Next.js 13, showcasing a variety of products and a seamless shopping experience.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <ToastProvider />
        <main>{children}</main> 
        <Footer />              
      </body>
    </html>
  );
}