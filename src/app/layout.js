import "./globals.css";

export const metadata = {
  title: "Pixel-Core",
  description: "Product page",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}