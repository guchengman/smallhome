import type { APIRoute } from 'astro';
import { getDb } from '../../../db';
import { users } from '../../../db/schema';
import { requireAuth } from '../../../middleware/auth';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const payload = requireAuth(request, locals.runtime.env.JWT_SECRET || 'smallhome-dev-secret');
    const db = getDb(locals.runtime.env);

    const result = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        role: users.role,
        status: users.status,
        bio: users.bio,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, payload.sub))
      .all();

    if (result.length === 0) {
      return new Response(JSON.stringify({ error: '用户不存在' }), { status: 404 });
    }

    return new Response(JSON.stringify(result[0]), { status: 200 });
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      const e = err as { status: number; message: string };
      return new Response(JSON.stringify({ error: e.message }), { status: e.status });
    }
    return new Response(JSON.stringify({ error: '获取用户信息失败' }), { status: 500 });
  }
};