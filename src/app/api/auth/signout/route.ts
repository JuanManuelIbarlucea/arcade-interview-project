import { clearSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await clearSession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Signout error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
