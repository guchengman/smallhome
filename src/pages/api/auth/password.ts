import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';
import { getDb } from '../../../db';
import { users } from '../../../db/schema';
import { requireAuth } from '../../../middleware/auth';
import { eq } from 'drizzle-orm';

export const PUT: APIRoute = async ({ request, locals }) => {
  try {
    const payload = requireAuth(request, locals.runtime.env.JWT_SECRET || 'smallhome-dev-secret');
    const { oldPassword, newPassword } = await request.json();

    if (!newPassword || newPassword.length < 6) {
      return new Response(JSON.stringify({ error: '新密码至少6位' }), { status: 400 });
    }

    const db = getDb(locals.runtime.env);
    const result = await db.select().from(users).where(eq(users.id, payload.sub)).all();
    const user = result[0];

    if (!user) {
      return new Response(JSON.stringify({ error: '用户不存在' }), { status: 404 });
    }

    if (oldPassword) {
      const valid = await bcrypt.compare(oldPassword, user.passwordHash);
      if (!valid) {
        return new Response(JSON.stringify({ error: '原密码错误' }), { status: 400 });
      }
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db
      .update(users)
      .set({ passwordHash, passwordReset: 0 })
      .where(eq(users.id, payload.sub))
      .run();

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      const e = err as { status: number; message: string };
      return new Response(JSON.stringify({ error: e.message }), { status: e.status });
    }
    return new Response(JSON.stringify({ error: '修改密码失败' }), { status: 500 });
  }
};