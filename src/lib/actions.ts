"use server";

import {
  addToFavorites,
  removeFromFavorites,
  setSessionConsent,
} from "./session";

export async function toggleFavoriteAction(
  itemId: string,
  isFavorite: boolean
) {
  try {
    if (isFavorite) {
      await addToFavorites(itemId);
    } else {
      await removeFromFavorites(itemId);
    }
    return { success: true };
  } catch (error) {
    console.error("お気に入りの更新に失敗しました:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function setConsentAction() {
  try {
    const session = await setSessionConsent();
    console.log("[Action] Consent set, session:", {
      consented: session.consented,
      favoritesCount: session.favorites.length,
    });
    return { success: true, session };
  } catch (error) {
    console.error("Cookie許可の設定に失敗しました:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
