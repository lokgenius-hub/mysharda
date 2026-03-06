export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/supabase-server";

export async function GET() {
  // Public endpoint — menu is visible to POS and public website
  const { data, error } = await db
    .from("menu_items")
    .select("*")
    .eq("is_active", true)
    .order("category")
    .order("sort_order");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, category, price, description, is_veg, tax_rate, image_url } = body;
  if (!name || !category || !price) {
    return NextResponse.json({ error: "name, category, price required" }, { status: 400 });
  }

  const { data, error } = await db.from("menu_items").insert({
    name, category, price: parseFloat(price),
    description, is_veg: !!is_veg,
    tax_rate: parseFloat(tax_rate ?? "5"),
    image_url, is_active: true,
    sort_order: 0,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const { data, error } = await db.from("menu_items").update({
    ...updates,
    updated_at: new Date().toISOString(),
  }).eq("id", id).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  // Soft delete
  const { error } = await db.from("menu_items").update({ is_active: false }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
