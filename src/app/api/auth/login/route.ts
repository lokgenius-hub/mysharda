import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase-server";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username?.trim() || !password?.trim()) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    // Look up user in admin_users table
    const { data: users, error } = await db
      .from("admin_users")
      .select("id, username, password_hash, role, display_name, is_active")
      .eq("username", username.trim().toLowerCase())
      .limit(1);

    if (error) {
      console.error("[Login] DB error:", error.message);
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const user = users?.[0];

    if (!user || !user.is_active) {
      // Timing-safe: still verify a dummy hash to prevent timing attacks
      verifyPassword(password, "dummy:0000000000000000000000000000000000000000000000000000000000000000");
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const valid = verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    // Update last_login
    await db.from("admin_users").update({ last_login: new Date().toISOString() }).eq("id", user.id);

    // Create session cookie
    await createSession({
      userId: user.id,
      role: user.role,
      displayName: user.display_name ?? user.username,
    });

    return NextResponse.json({
      success: true,
      role: user.role,
      displayName: user.display_name ?? user.username,
    });
  } catch (err) {
    console.error("[Login] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
