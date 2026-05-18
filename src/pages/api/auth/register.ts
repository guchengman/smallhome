import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';
import { getDb } from '../../../db';
import { users, verificationCodes } from '../../../db/schema';
import { signToken } from '../../../middleware/auth';
import { eq, and } from 'drizzle-orm';
import { v4 as uuid } from '../../../utils/uuid';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { username, email, password, code } = await request.json();

    // Validation
    if (!username || !email || !password || !code) {
      return new Response(JSON.stringify({ error: '请填写所有必填项' }), { status: 400 });
    }
    if (username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(username)) {
      return new Response(JSON.stringify({ error: '用户名至少3位，仅允许字母数字下划线' }), { status: 400 });
    }
    if (password.length < 6) {
      return new Response(JSON.stringify({ error: '密码至少6位' }), { status: 400 });
    }
    if (!email.includes('@')) {
      return new Response(JSON.stringify({ error: '请输入有效邮箱' }), { status: 400 });
    }

    const db = getDb(locals.runtime.env);

    // Verify code
    const codes = await db
      .select()
      .from(verificationCodes)
      .where(
        and(
          eq(verificationCodes.email, email),
          eq(verificationCodes.code, code),
          eq(verificationCodes.used, 0),
        ),
      )
      .all();

    const validCode = codes.find(
      (c) => new Date(c.expiresAt) > new Date() && c.purpose === 'register',
    );

    if (!validCode) {
      return new Response(JSON.stringify({ error: '验证码无效或已过期' }), { status: 400 });
    }

    // Check username/email uniqueness
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .all();

    if (existingUser.length > 0) {
      return new Response(JSON.stringify({ error: '用户名已注册' }), { status: 409 });
    }

    const existingEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .all();

    if (existingEmail.length > 0) {
      return new Response(JSON.stringify({ error: '邮箱已注册' }), { status: 409 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await db
      .insert(users)
      .values({
        username,
        email,
        passwordHash,
        displayName: username,
        role: 'user',
        status: 'active',
      })
      .returning()
      .get();

    // Mark code as used
    await db
      .update(verificationCodes)
      .set({ used: 1 })
      .where(eq(verificationCodes.id, validCode.id))
      .run();

    // Generate JWT
    const jti = uuid();
    const token = signToken({
      sub: result.id,
      username: result.username,
      email: result.email,
      role: result.role as 'user' | 'editor' | 'admin',
      status: result.status,
      jti,
    }, locals.runtime.env.JWT_SECRET || 'smallhome-dev-secret');

    return new Response(
      JSON.stringify({
        token,
        user: {
          id: result.id,
          username: result.username,
          email: result.email,
          role: result.role,
          displayName: result.displayName,
        },
      }),
      { status: 201 },
    );
  } catch (err) {
    console.error('Register error:', err);
    return new Response(JSON.stringify({ error: '注册失败，请稍后重试' }), { status: 500 });
  }
};