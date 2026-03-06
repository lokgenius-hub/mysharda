import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase-server";
import { sendEnquiryEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, enquiry_type, message, preferred_date, guests } = body;

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: "Name and phone required" }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      return NextResponse.json({ error: "Enter a valid 10-digit phone number" }, { status: 400 });
    }

    const enquiryData = {
      name: name.trim(),
      phone: cleanPhone,
      email: email?.trim() || null,
      enquiry_type: enquiry_type || "general",
      message: message?.trim() || null,
      preferred_date: preferred_date || null,
      guests: guests ? parseInt(guests) : null,
      status: "pending",
      is_read: false,
    };

    const { error } = await db.from("enquiries").insert(enquiryData);

    if (error) {
      console.error("[Enquiry] DB error:", error.message);
      return NextResponse.json({ error: "Failed to save enquiry" }, { status: 500 });
    }

    // Send email notification to admin (non-blocking — don't fail if email fails)
    sendEnquiryEmail(enquiryData).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Enquiry submitted! Our team will contact you within 2 hours.",
    });
  } catch (err) {
    console.error("[Enquiry]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
