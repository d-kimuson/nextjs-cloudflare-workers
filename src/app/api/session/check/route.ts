import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    console.log("[API] Session check request received");
    const session = await getSession();

    const response = {
      consented: session?.consented ?? false,
      hasFavorites: session?.favorites?.length ?? 0,
    };

    console.log("[API] Session check response:", response);

    return NextResponse.json(response);
  } catch (error) {
    console.error("セッション確認エラー:", error);
    return NextResponse.json(
      { error: "セッションの確認に失敗しました" },
      { status: 500 }
    );
  }
}
