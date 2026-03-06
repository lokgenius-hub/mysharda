export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;

  let query = db.from("enquiries").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  if (type) query = query.eq("enquiry_type", type);
  query = query.range((page - 1) * limit, page * limit - 1);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ enquiries: data ?? [] });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status, notes } = await req.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const { error } = await db.from("enquiries").update({
    ...(status && { status }),
    ...(notes !== undefined && { notes }),
    is_read: true,
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  const { error } = await db.from("enquiries").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
