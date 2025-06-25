import type { Context } from "hono";
import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { EncryptJWT, jwtDecrypt } from "jose";
import { z } from "zod";
import { getCurrentDate } from "../../../lib/date/currentDate";
import { envUtils } from "../../../lib/envUtils";
import type { HonoVariables } from "../app";

const joseSecret = Buffer.from(envUtils.getEnv("JOSE_SECRET"), "base64");

export const sessionIdentifierSchema = z.object({
  userId: z.string(),
});

export type SessionIdentifier = z.infer<typeof sessionIdentifierSchema>;

export const sessionBodySchema = z.object({
  favorite: z.object({
    works: z.array(z.string()),
    makers: z.array(z.string()),
    series: z.array(z.string()),
  }),
});

export type SessionBody = z.infer<typeof sessionBodySchema>;

export const sessionSchema = z.intersection(
  sessionIdentifierSchema,
  sessionBodySchema,
);

export type SessionData = z.infer<typeof sessionSchema>;

const encryptSession = async (payload: SessionData): Promise<string> => {
  return await new EncryptJWT(payload)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(
      new Date(getCurrentDate().getTime() + 1000 * 60 * 60 * 24 * 30),
    )
    .encrypt(joseSecret);
};

const decryptSession = async (
  jwt: string,
): Promise<SessionData | undefined> => {
  try {
    const { payload } = await jwtDecrypt(jwt, joseSecret);
    return payload as unknown as SessionData;
  } catch (error) {
    console.error("[Session] Decrypt error:", error);
    return undefined;
  }
};

export const sessionHandler = async (
  c: Context<
    {
      Variables: HonoVariables;
    },
    string,
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    {}
  >,
) => {
  const upsertSession = async (updated: SessionData) => {
    const cookie = await encryptSession(updated);
    await setSignedCookie(
      c,
      "session",
      cookie,
      envUtils.getEnv("AUTH_SECRET"),
      {
        httpOnly: true,
        secure: envUtils.getEnv("ENVIRONMENT") === "production",
        sameSite: "strict",
      },
    );
    c.set("session", updated);
  };

  const resetSession = async () => {
    deleteCookie(c, "session", {
      httpOnly: true,
      secure: envUtils.getEnv("ENVIRONMENT") === "production",
      sameSite: "strict",
    });
  };

  return {
    upsertSession,
    resetSession,
  };
};

export const sessionMiddleware = createMiddleware<{
  Variables: HonoVariables;
}>(async (c, next) => {
  const cookie = await getSignedCookie(
    c,
    envUtils.getEnv("AUTH_SECRET"),
    "session",
  );

  if (typeof cookie !== "string") {
    console.log("cookie is not string");
    await next();
    return;
  }

  const session = await decryptSession(cookie);
  if (session !== undefined) {
    console.log("failed to decrypt session");
    c.set("session", session);
  }

  await next();
});
