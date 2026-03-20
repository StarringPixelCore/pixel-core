import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Pixel-Core",
  description: "Product page",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}