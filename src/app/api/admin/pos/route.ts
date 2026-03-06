export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/supabase-server";

/**
 * Push local IndexedDB orders to Supabase — SUMMARY ONLY.
 * Full item details stay in IndexedDB (offline POS).
 * Only order header with item_count and item_summary is synced.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orders } = await req.json() as { orders: Record<string, unknown>[] };
  if (!orders?.length) return NextResponse.json({ synced: 0 });

  let synced = 0;
  const errors: string[] = [];

  for (const order of orders) {
    try {
      // Extract items to build summary, then discard them
      const { items, ...orderData } = order as {
        items?: { item_name?: string; quantity?: number }[];
        [k: string]: unknown;
      };

      // Build a compact text summary of items (e.g. "Butter Chicken x2, Naan x4, ...")
      const itemCount = items?.length ?? 0;
      const itemSummary = items
        ?.map((it) => `${it.item_name ?? 'Item'}${(it.quantity ?? 1) > 1 ? ` x${it.quantity}` : ''}`)
        .join(', ')
        .slice(0, 500) ?? ''; // Cap at 500 chars

      // Upsert only the order header + summary (NO pos_order_items)
      const { error: orderErr } = await db
        .from("pos_orders")
        .upsert({
          ...orderData,
          item_count: itemCount,
          item_summary: itemSummary,
          synced_at: new Date().toISOString(),
        });

      if (orderErr) { errors.push(orderErr.message); continue; }
      synced++;
    } catch (e) {
      errors.push(String(e));
    }
  }

  return NextResponse.json({ synced, errors: errors.length ? errors : undefined });
}

/** Get recent POS order summaries */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") ?? new Date().toISOString().split("T")[0];
  const limit = parseInt(searchParams.get("limit") ?? "50");

  const { data, error } = await db
    .from("pos_orders")
    .select("*") // No longer joining pos_order_items
    .gte("created_at", `${date}T00:00:00`)
    .lte("created_at", `${date}T23:59:59`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const total = (data ?? []).reduce((s, o) => s + (Number(o.total_amount ?? o.total) || 0), 0);
  return NextResponse.json({ orders: data ?? [], total, date });
}
