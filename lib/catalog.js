export const minimumQuantity = 25;
export const phone = "+91 7305465777";
export const whatsappContact = "https://wa.me/917305465777";
export const placeholder = "/images/unsplash-gifts.webp";

export function productOrderUrl(product) {
  return `https://wa.me/917305465777?text=${encodeURIComponent("Hello Varnam Gifts! I am interested in ordering the '" + product.name + "'. The minimum order is " + minimumQuantity + " items. Could you please share the pricing and bulk availability?")}`;
}

export const collections = [
  {
    id: "german-silver", legacyId: "silver", title: "German Silver", subtitle: "Keepsakes with a timeless finish.",
    products: [
      { name: "Decorative Tray Set", image: "/images/1-1.webp" },
      { name: "Silver Puja Set", image: "/images/1-2.webp" },
      { name: "Floral Pedestal Bowl", image: "/images/1-3.webp" },
    ],
  },
  {
    id: "brass", legacyId: "gold", title: "Brass", subtitle: "Warm metalwork rooted in tradition.",
    products: [
      { name: "Traditional Dabara Set", image: "/images/2-1.webp" },
      { name: "Brass Diya Pair", image: "/images/2-2.webp" },
      { name: "Peacock Spice Box", image: "/images/2-4.webp" },
    ],
  },
  {
    id: "trending", title: "Trending Gifts", subtitle: "Little luxuries for everyday celebrations.",
    products: [
      { name: "Printed Gift Jars", image: "/images/3-1.webp" },
      { name: "Snack Jar Sets", image: "/images/3-2.webp" },
      { name: "Mini Tray Sets", image: "/images/3-3.webp" },
    ],
  },
  {
    id: "corporate", title: "Corporate Gifts", subtitle: "Considered gifts for teams, clients and milestones.",
    products: [
      { name: "Curated Gift Hampers", image: "/images/4-1.webp" },
      { name: "Executive Gift Sets", image: "/images/4-3.webp" },
      { name: "Luxury Heritage Boxes", image: "/images/4-4.webp" },
    ],
  },
];
