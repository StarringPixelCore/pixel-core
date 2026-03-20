import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: "40px" }}>
      <h1>Welcome to Cocoir</h1>
      <Link href="/products">Go to Products</Link>
    </main>
  );
}