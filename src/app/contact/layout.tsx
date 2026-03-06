import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Sharda Palace | Hotel Location near Bhabua Kaimur | Directions",
  description:
    "Contact Sharda Palace on Bhabua Road, Bijnor — nearest hotel from Bhabua (Kaimur district Bihar), Chainpur, Sasaram & Rohtas. Get directions, phone number, WhatsApp, and enquiry form.",
  keywords: [
    "Sharda Palace contact", "hotel Bhabua road address",
    "hotel near Bhabua phone number", "directions to hotel from Bhabua",
    "how to reach hotel near Kaimur Bihar",
    "nearest hotel from Kaimur district", "contact hotel near Sasaram",
    "hotel near Chainpur phone", "Bijnor hotel address",
    "hotel location near Bhabua Kaimur road",
    "hotel near NH-2 Bhabua road", "hotel near Bhabua village",
    "Sharda Palace phone number", "Sharda Palace Bijnor location",
    "book hotel near Kaimur Bihar", "hotel enquiry near Bhabua",
  ],
  openGraph: {
    title: "Contact & Directions | Sharda Palace — Bhabua Road, Bijnor",
    description:
      "Find Sharda Palace on Bhabua Road, Bijnor. Nearest luxury hotel from Bhabua, Kaimur, Chainpur and Sasaram. Call +91 73035 84266.",
    type: "website",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
