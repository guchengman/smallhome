import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';
import { getDb } from '../../../db';
import { users, verificationCodes } from '../../../db/schema';
import { eq, and } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword) {
      return new Response(JSON.stringify({ error: '请填写所有必填项' }), { status: 400 });
    }
    if (newPassword.length < 6) {
      return new Response(JSON.stringify({ error: '密码至少6位' }), { status: 400 });
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
      (c) => new Date(c.expiresAt) > new Date() && c.purpose === 'reset',
    );

    if (!validCode) {
      return new Response(JSON.stringify({ error: '验证码无效或已过期' }), { status: 400 });
    }

    // Hash and update password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db
      .update(users)
      .set({ passwordHash, passwordReset: 0 })
      .where(eq(users.email, email))
      .run();

    // Mark code as used
    await db
      .update(verificationCodes)
      .set({ used: 1 })
      .where(eq(verificationCodes.id, validCode.id))
      .run();

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Reset password error:', err);
    return new Response(JSON.stringify({ error: '重置密码失败，请稍后重试' }), { status: 500 });
  }
};