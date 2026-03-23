export async function toggleFeaturedProduct(productId, nextIsFeatured) {
  const res = await fetch("/api/products/toggle-featured", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, isFeatured: nextIsFeatured }),
  });

  const data = await res.json();
  return { ok: !!data.success, data };
}
