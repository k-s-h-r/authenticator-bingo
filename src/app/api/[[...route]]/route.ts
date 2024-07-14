import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { Users, BingoCards, GroupParticipants, BingoGroups } from '@/db/schema';
import { ulid } from 'ulidx';
import { eq, and } from 'drizzle-orm';
import { getCookie, getSignedCookie, deleteCookie } from 'hono/cookie';

export const runtime = 'edge';

// This ensures c.env.DB is correctly typed
type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>().basePath('/api');

/*
import * as schema from "@/db/schema";
import { getRequestContext } from "@cloudflare/next-on-pages";

function getDB() {
  if (process.env.NODE_ENV === "development") {
    const { env } = getRequestContext();
    return drizzle(env.DB, { schema });
  }
  // Production
  return drizzle(process.env.DB, { schema });
}

export const db = getDB();
*/

const routes = app.post('/xxx', async (c) => {
  const userId = getCookie(c, 'userId') ?? '';
  const db = drizzle(process.env.DB);
  const user = await db
    .insert(Users)
    .values({ user_id: userId, user_name: null })
    .returning()
    .get();
  return c.json(user);
});

export const GET = app.fetch;
export const POST = app.fetch;

export type AppType = typeof routes;
