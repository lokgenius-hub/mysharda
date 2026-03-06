import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hotel Rooms near Bhabua Kaimur | AC Rooms | Sharda Palace Bijnor",
  description:
    "Book AC deluxe rooms and suites at Sharda Palace on Bhabua Road, Bijnor — the nearest luxury hotel for guests from Bhabua, Kaimur, Chainpur and Sasaram. Standard, Deluxe & Suite options. 24/7 room service.",
  keywords: [
    "hotel rooms near Bhabua", "hotel near Kaimur Bihar", "AC hotel Bhabua Bihar",
    "hotel near Chainpur", "hotel near Sasaram Bihar", "best hotel Bhabua road",
    "luxury hotel near Kaimur", "hotel Bijnor Uttar Pradesh",
    "Deluxe rooms Bhabua", "suite hotel Kaimur district",
    "overnight stay near Bhabua", "book hotel near Kaimur",
    "hotel check-in Bhabua road", "budget hotel Bhabua highway",
    "Sharda Palace rooms", "AC room Bijnor",
  ],
  openGraph: {
    title: "Hotel Rooms near Bhabua & Kaimur | Sharda Palace",
    description:
      "Nearest luxury hotel for Bhabua, Kaimur, Chainpur, Sasaram. AC rooms from ₹1200/night. Book online.",
    type: "website",
  },
};

export default function HotelLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
