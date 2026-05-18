import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';
import { getDb } from '../../../db';
import { users } from '../../../db/schema';
import { signToken } from '../../../middleware/auth';
import { eq } from 'drizzle-orm';
import { v4 as uuid } from '../../../utils/uuid';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return new Response(JSON.stringify({ error: '请输入用户名和密码' }), { status: 400 });
    }

    const db = getDb(locals.runtime.env);

    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .all();

    const user = result[0];
    if (!user) {
      return new Response(JSON.stringify({ error: '用户名或密码错误' }), { status: 401 });
    }

    if (user.status === 'suspended') {
      return new Response(JSON.stringify({ error: '账号已被停用' }), { status: 403 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return new Response(JSON.stringify({ error: '用户名或密码错误' }), { status: 401 });
    }

    if (user.passwordReset) {
      return new Response(
        JSON.stringify({ needSetupPassword: true, message: '请设置新密码' }),
        { status: 200 },
      );
    }

    const jti = uuid();
    const token = signToken({
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role as 'user' | 'editor' | 'admin',
      status: user.status,
      jti,
    }, locals.runtime.env.JWT_SECRET || 'smallhome-dev-secret');

    return new Response(
      JSON.stringify({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          displayName: user.displayName,
        },
      }),
      { status: 200 },
    );
  } catch (err) {
    console.error('Login error:', err);
    return new Response(JSON.stringify({ error: '登录失败，请稍后重试' }), { status: 500 });
  }
};