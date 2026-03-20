import type { Metadata } from "next";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Sharda Palace Restaurant",
  description:
    "Best vegetarian North Indian restaurant near Bhabua, Kaimur, Chainpur and Sasaram. Fresh home-style cooking, family dining, buffet and à la carte.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Bhabua Road",
    addressLocality: "Bhabua",
    addressRegion: "Uttar Pradesh",
    postalCode: "246701",
    addressCountry: "IN",
  },
  telephone: "+917303584266",
  url: "https://lokgenius-hub.github.io/mysharda/restaurant/",
  servesCuisine: ["North Indian", "Vegetarian", "Chinese", "Indian Sweets"],
  priceRange: "₹₹",
  openingHours: "Mo-Su 07:00-23:00",
  hasMenu: "https://lokgenius-hub.github.io/mysharda/restaurant/",
};

export const metadata: Metadata = {
  title: "Best Restaurant near Bhabua Kaimur | Veg Restaurant | Sharda Palace",
  description:
    "Best pure veg North Indian restaurant near Bhabua, Kaimur, Chainpur and Sasaram. Fresh roti, dal, sabzi, thali, sweets and Chinese. Open daily 7 AM–11 PM. Family dining at Sharda Palace, Bijnor.",
  keywords: [
    "restaurant near Bhabua", "restaurant Bhabua Bihar",
    "veg restaurant Kaimur", "vegetarian restaurant near Kaimur Bihar",
    "restaurant near Chainpur", "restaurant near Sasaram",
    "North Indian restaurant Bhabua road", "best restaurant Bijnor",
    "family restaurant near Bhabua", "thali near Kaimur Bihar",
    "pure veg food near Bhabua", "vegetarian dining Kaimur",
    "dhaba near Bhabua highway", "Indian food near Sasaram",
    "lunch dinner near Chainpur", "Sharda Palace restaurant Bijnor",
    "buffet near Bhabua", "Chinese food near Kaimur",
  ],
  openGraph: {
    title: "Best Veg Restaurant near Bhabua, Kaimur, Sasaram | Sharda Palace",
    description:
      "Pure veg North Indian restaurant on Bhabua Road, Bijnor. Fresh daily cooking, family dining. Open 7 AM–11 PM.",
    type: "website",
  },
};

export default function RestaurantLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
