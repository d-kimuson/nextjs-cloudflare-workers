import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    console.log("[API] Favorites request received");
    const session = await getSession();

    const response = {
      consented: session?.consented ?? false,
      favorites: session?.favorites ?? [],
    };

    console.log("[API] Favorites response:", response);

    return NextResponse.json(response);
  } catch (error) {
    console.error("お気に入り取得エラー:", error);
    return NextResponse.json(
      { error: "お気に入りの取得に失敗しました" },
      { status: 500 }
    );
  }
}
