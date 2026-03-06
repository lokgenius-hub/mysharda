import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/supabase-server";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const today = new Date().toISOString().split("T")[0];

    const [enquiries, rooms, tables, menuItems] = await Promise.all([
      db.from("enquiries").select("id, status, created_at").order("created_at", { ascending: false }).limit(5),
      db.from("rooms").select("id, name, status").limit(50),
      db.from("restaurant_tables").select("id, name, status").limit(30),
      db.from("menu_items").select("id, name, category, price, is_active").limit(100),
    ]);

    // Simple stats
    const totalEnquiries = (enquiries.data ?? []).length;
    const pendingEnquiries = (enquiries.data ?? []).filter((e) => e.status === "pending").length;
    const availableRooms = (rooms.data ?? []).filter((r) => r.status === "available").length;
    const occupiedRooms = (rooms.data ?? []).filter((r) => r.status === "occupied").length;
    const activeMenu = (menuItems.data ?? []).filter((m) => m.is_active).length;

    return NextResponse.json({
      today,
      stats: {
        totalEnquiries,
        pendingEnquiries,
        availableRooms,
        occupiedRooms,
        totalRooms: (rooms.data ?? []).length,
        activeTables: (tables.data ?? []).filter((t) => t.status === "available").length,
        totalTables: (tables.data ?? []).length,
        activeMenu,
      },
      recentEnquiries: enquiries.data?.slice(0, 5) ?? [],
    });
  } catch (err) {
    console.error("[Dashboard API]", err);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
