import type { Metadata } from "next";
import "./globals.css";
import ChatBot from "@/components/ChatBot";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Hotel",
      "@id": "https://lokgenius-hub.github.io/mysharda/#hotel",
      name: "Sharda Palace",
      url: "https://lokgenius-hub.github.io/mysharda/",
      telephone: "+917303584266",
      email: "info@shardapalace.in",
      description:
        "Luxury hotel, restaurant and banquet hall on Bhabua Road, Bijnor — the nearest premium stay for guests from Bhabua, Kaimur, Chainpur, and Sasaram.",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Bhabua Road",
        addressLocality: "Bijnor",
        addressRegion: "Uttar Pradesh",
        postalCode: "246701",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 29.3722,
        longitude: 78.0978,
      },
      image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&q=80",
      priceRange: "₹₹",
      amenityFeature: [
        { "@type": "LocationFeatureSpecification", name: "Free Wi-Fi",          value: true },
        { "@type": "LocationFeatureSpecification", name: "AC Rooms",            value: true },
        { "@type": "LocationFeatureSpecification", name: "Restaurant",          value: true },
        { "@type": "LocationFeatureSpecification", name: "Banquet Hall",        value: true },
        { "@type": "LocationFeatureSpecification", name: "Wedding Venue",       value: true },
        { "@type": "LocationFeatureSpecification", name: "Conference Hall",     value: true },
        { "@type": "LocationFeatureSpecification", name: "Room Service",        value: true },
        { "@type": "LocationFeatureSpecification", name: "24/7 Reception",      value: true },
        { "@type": "LocationFeatureSpecification", name: "Parking",             value: true },
      ],
      servesCuisine: ["North Indian", "Vegetarian", "Chinese"],
      hasMap: "https://maps.google.com/?q=Sharda+Palace+Bijnor",
      sameAs: ["https://facebook.com", "https://instagram.com"],
      areaServed: [
        { "@type": "City", name: "Bijnor", containedInPlace: { "@type": "State", name: "Uttar Pradesh" } },
        { "@type": "City", name: "Bhabua", containedInPlace: { "@type": "State", name: "Bihar" } },
        { "@type": "City", name: "Kaimur", containedInPlace: { "@type": "State", name: "Bihar" } },
        { "@type": "City", name: "Chainpur", containedInPlace: { "@type": "State", name: "Bihar" } },
        { "@type": "City", name: "Sasaram", containedInPlace: { "@type": "State", name: "Bihar" } },
      ],
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://lokgenius-hub.github.io/mysharda/#localbusiness",
      name: "Sharda Palace — Hotel, Restaurant & Banquet",
      telephone: "+917303584266",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Bhabua Road",
        addressLocality: "Bijnor",
        addressRegion: "Uttar Pradesh",
        postalCode: "246701",
        addressCountry: "IN",
      },
      openingHoursSpecification: [
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], opens: "00:00", closes: "23:59" }
      ],
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://lokgenius-hub.github.io"),
  title: {
    default: "Sharda Palace — Best Hotel near Bhabua Kaimur | Bijnor UP",
    template: "%s | Sharda Palace",
  },
  description:
    "Sharda Palace on Bhabua Road, Bijnor — the nearest luxury hotel, restaurant & banquet hall for Bhabua, Kaimur, Chainpur, Sasaram. AC rooms, North Indian dining, wedding & event halls.",
  keywords: [
    "Sharda Palace",
    "hotel near Bhabua", "hotel Bhabua", "best hotel Bhabua", "hotel in Bhabua Bihar",
    "hotel near Kaimur", "hotel Kaimur Bihar", "best hotel Kaimur",
    "hotel near Chainpur", "hotel Chainpur Bihar",
    "hotel near Sasaram", "hotel near Sasaram Bihar",
    "hotel Bhabua Road Bijnor", "hotel Bijnor UP",
    "hotel on Bhabua road", "nearest hotel from Bhabua",
    "nearest hotel Kaimur district", "nearest hotel from Chainpur",
    "marriage hall Bhabua", "banquet hall Kaimur", "wedding venue near Sasaram",
    "shaadi hall Bhabua Kaimur", "marriage hall Bijnor",
    "event hall Chainpur", "banquet hall near Kaimur Bihar",
    "reception hall Bhabua", "birthday hall Kaimur",
    "conference hall near Bhabua", "corporate event Kaimur",
    "restaurant Bhabua", "restaurant near Bhabua",
    "veg restaurant Kaimur", "restaurant near Kaimur Bihar",
    "dining near Chainpur", "North Indian food Bhabua",
    "family restaurant near Sasaram",
    "AC hotel Bhabua", "AC rooms near Kaimur",
    "luxury hotel near Sasaram Bihar", "best hotel near Kaimur Bihar",
    "Kaimur district hotel", "Rohtas Bihar hotel",
  ],
  openGraph: {
    title: "Sharda Palace — Best Hotel near Bhabua, Kaimur, Chainpur, Sasaram",
    description:
      "Luxury hotel, restaurant & wedding venue on Bhabua Road, Bijnor. Serving Bhabua, Kaimur, Chainpur & Sasaram. Book AC rooms, banquet halls & dining.",
    type: "website",
    url: "https://lokgenius-hub.github.io/mysharda/",
    siteName: "Sharda Palace",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sharda Palace — Hotel near Bhabua Kaimur | Bijnor UP",
    description: "AC rooms, wedding halls & restaurant on Bhabua Road, Bijnor. Nearest luxury hotel from Bhabua, Kaimur, Chainpur, Sasaram.",
  },
  alternates: {
    canonical: "https://lokgenius-hub.github.io/mysharda/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
        <ChatBot />
      </body>
    </html>
  );
}
