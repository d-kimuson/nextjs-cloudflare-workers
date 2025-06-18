"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { atom, useAtom, Provider } from "jotai";
import { CookieConsent } from "./cookie-consent";
import {
  addToFavorites,
  removeFromFavorites,
  createSession,
  type SessionResult,
} from "@/lib/session";

// セッションデータの型定義
interface SessionData {
  consented: boolean;
  favorites: string[];
  preferences?: {
    genres: Record<string, number>;
  };
}

// Jotai atoms
export const sessionAtom = atom<SessionData | null>(null);
export const sessionLoadingAtom = atom(false);

interface SessionContextType {
  isConsentGiven: boolean;
  setConsentGiven: (consent: boolean) => void;
  showConsentBanner: () => void;
  // 新しいセッション管理メソッド
  session: SessionData | null;
  isLoading: boolean;
  favorites: string[];
  loadSession: () => Promise<void>;
  addFavorite: (itemId: string) => Promise<SessionResult>;
  removeFavorite: (itemId: string) => Promise<SessionResult>;
  updateGenrePreference: (genre: string) => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}

interface SessionProviderProps {
  children: ReactNode;
}

// セッション管理を行う内部コンポーネント
function SessionManager({ children }: { children: ReactNode }) {
  const [session, setSession] = useAtom(sessionAtom);
  const [isLoading, setIsLoading] = useAtom(sessionLoadingAtom);
  const [isConsentGiven, setIsConsentGiven] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  // セッション読み込み
  const loadSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/session/favorites");
      const data = (await response.json()) as SessionData;
      setSession(data);
      setIsConsentGiven(data.consented);
    } catch (error) {
      console.error("セッション読み込みエラー:", error);
      setSession({ consented: false, favorites: [] });
      setIsConsentGiven(false);
    } finally {
      setIsLoading(false);
    }
  }, [setSession, setIsLoading]);

  // お気に入り追加
  const addFavorite = useCallback(
    async (itemId: string): Promise<SessionResult> => {
      try {
        const result = await addToFavorites(itemId);
        if (result?.success) {
          setSession((prev) => {
            if (!prev) return { consented: true, favorites: [itemId] };
            if (!prev.favorites.includes(itemId)) {
              return {
                ...prev,
                favorites: [...prev.favorites, itemId],
              };
            }
            return prev;
          });
        } else if (result?.error?.includes("Session consent required")) {
          window.dispatchEvent(new CustomEvent("show-cookie-consent"));
        }
        return result;
      } catch (error) {
        console.error("お気に入り追加エラー:", error);
        return { success: false, error: String(error) };
      }
    },
    [setSession]
  );

  // お気に入り削除
  const removeFavorite = useCallback(
    async (itemId: string): Promise<SessionResult> => {
      try {
        const result = await removeFromFavorites(itemId);
        if (result?.success) {
          setSession((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              favorites: prev.favorites.filter((id) => id !== itemId),
            };
          });
        }
        return result;
      } catch (error) {
        console.error("お気に入り削除エラー:", error);
        return { success: false, error: String(error) };
      }
    },
    [setSession]
  );

  // ジャンル好み更新
  const updateGenrePreference = useCallback(
    (genre: string) => {
      setSession((prev) => {
        if (!prev) return prev;
        const newPreferences = {
          ...prev.preferences,
          genres: {
            ...prev.preferences?.genres,
            [genre]: (prev.preferences?.genres?.[genre] || 0) + 1,
          },
        };
        return {
          ...prev,
          preferences: newPreferences,
        };
      });
    },
    [setSession]
  );

  const setConsentGiven = useCallback(
    async (consent: boolean) => {
      setIsConsentGiven(consent);
      if (consent) {
        setShowBanner(false);
        try {
          const result = await createSession();
          if (result?.success) {
            await loadSession();
          }
        } catch (error) {
          console.error("セッション作成エラー:", error);
        }
      }
    },
    [loadSession]
  );

  const showConsentBanner = useCallback(() => {
    if (!isConsentGiven) {
      setShowBanner(true);
    }
  }, [isConsentGiven]);

  useEffect(() => {
    loadSession();

    // カスタムイベントリスナーを追加
    const handleShowConsentBanner = () => showConsentBanner();
    window.addEventListener("show-cookie-consent", handleShowConsentBanner);

    return () => {
      window.removeEventListener(
        "show-cookie-consent",
        handleShowConsentBanner
      );
    };
  }, [loadSession, showConsentBanner]);

  return (
    <SessionContext.Provider
      value={{
        isConsentGiven,
        setConsentGiven,
        showConsentBanner,
        session,
        isLoading,
        favorites: session?.favorites ?? [],
        loadSession,
        addFavorite,
        removeFavorite,
        updateGenrePreference,
      }}
    >
      {children}
      {showBanner && <CookieConsent onConsent={() => setConsentGiven(true)} />}
    </SessionContext.Provider>
  );
}

export function SessionProvider({ children }: SessionProviderProps) {
  return (
    <Provider>
      <SessionManager>{children}</SessionManager>
    </Provider>
  );
}
