import type { APIRoute } from 'astro';
import { getDb } from '../../../db';
import { users } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const url = new URL(request.url);
    const username = url.searchParams.get('username');
    if (!username || username.length < 3) {
      return new Response(JSON.stringify({ exists: false }), { status: 200 });
    }

    const db = getDb(locals.runtime.env);
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .all();

    return new Response(JSON.stringify({ exists: result.length > 0 }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: '查询失败' }), { status: 500 });
  }
};