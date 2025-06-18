"use server";

import { EncryptJWT, jwtDecrypt } from "jose";
import { cookies } from "next/headers";

// セッションの型定義
export interface SessionData {
  userId?: string;
  favorites: string[];
  preferences: {
    genres: Record<string, number>;
  };
  consented: boolean;
  expiresAt: number;
  [key: string]: unknown; // JWTPayloadとの互換性のため
}

// 操作結果の型定義
export interface SessionResult {
  success: boolean;
  error?: string;
  data?: SessionData;
}

// 32バイト（256bit）のキーを生成
function getSecretKey(): Uint8Array {
  const secretString =
    process.env.SESSION_SECRET || "doujin-session-secret-key-32bytes";
  const encoder = new TextEncoder();
  const encoded = encoder.encode(secretString);

  // 32バイトにパディングまたは切り詰め
  const key = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    key[i] = encoded[i % encoded.length] || 0;
  }

  return key;
}

// セッションの設定
const SESSION_CONFIG = {
  cookieName: "doujin-session",
  secret: getSecretKey(),
  maxAge: 30 * 24 * 60 * 60, // 30日
} as const;

// セッションの暗号化
async function encryptSession(payload: SessionData): Promise<string> {
  return await new EncryptJWT(payload)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(new Date(Date.now() + SESSION_CONFIG.maxAge * 1000))
    .encrypt(SESSION_CONFIG.secret);
}

// セッションの復号化
async function decryptSession(jwt: string): Promise<SessionData | null> {
  try {
    const { payload } = await jwtDecrypt(jwt, SESSION_CONFIG.secret);
    return payload as unknown as SessionData;
  } catch (error) {
    console.error("[Session] Decrypt error:", error);
    return null;
  }
}

// セッションを取得
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_CONFIG.cookieName);

  if (process.env.NODE_ENV === "development") {
    console.log(
      "[Session] Getting session, cookie exists:",
      !!sessionCookie?.value
    );
  }

  if (!sessionCookie?.value) {
    return null;
  }

  const session = await decryptSession(sessionCookie.value);
  console.log(
    "[Session] Decrypted session:",
    session
      ? {
          consented: session.consented,
          favoritesCount: session.favorites.length,
          expiresAt: new Date(session.expiresAt).toISOString(),
        }
      : "null"
  );

  return session;
}

// セッションを保存
export async function setSession(data: SessionData): Promise<void> {
  const cookieStore = await cookies();
  const encrypted = await encryptSession(data);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: SESSION_CONFIG.maxAge,
    path: "/",
  };

  // デバッグ用（開発環境のみ）
  if (process.env.NODE_ENV === "development") {
    console.log("[Session] Setting cookie with options:", {
      ...cookieOptions,
      dataPreview: {
        consented: data.consented,
        favoritesCount: data.favorites.length,
      },
    });
  }

  cookieStore.set(SESSION_CONFIG.cookieName, encrypted, cookieOptions);
}

// セッションを削除
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_CONFIG.cookieName);
}

// 新しいセッションを作成
export async function createSession(): Promise<SessionResult> {
  try {
    const session = {
      favorites: [],
      preferences: {
        genres: {},
      },
      consented: true,
      expiresAt: Date.now() + SESSION_CONFIG.maxAge * 1000,
    };

    await setSession(session);
    return { success: true, data: session };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// セッションの同意を設定
export async function setSessionConsent(): Promise<SessionResult> {
  try {
    let session = await getSession();

    if (!session) {
      const createResult = await createSession();
      if (!createResult.success || !createResult.data) {
        return { success: false, error: "Failed to create session" };
      }
      session = createResult.data;
    } else {
      session.consented = true;
      await setSession(session);
    }

    return { success: true, data: session };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// お気に入りに追加
export async function addToFavorites(itemId: string): Promise<SessionResult> {
  try {
    const session = await getSession();

    if (!session || !session.consented) {
      return { success: false, error: "Session consent required" };
    }

    if (!session.favorites.includes(itemId)) {
      session.favorites.push(itemId);
      await setSession(session);
    }

    return { success: true, data: session };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// お気に入りから削除
export async function removeFromFavorites(
  itemId: string
): Promise<SessionResult> {
  try {
    const session = await getSession();

    if (!session || !session.consented) {
      return { success: false, error: "Session consent required" };
    }

    session.favorites = session.favorites.filter((id) => id !== itemId);
    await setSession(session);

    return { success: true, data: session };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// ジャンル設定を更新
export async function updateGenrePreference(
  genre: string,
  increment = 1
): Promise<void> {
  const session = await getSession();

  if (!session || !session.consented) {
    return; // 同意がない場合は静かに無視
  }

  session.preferences.genres[genre] =
    (session.preferences.genres[genre] || 0) + increment;
  await setSession(session);
}
