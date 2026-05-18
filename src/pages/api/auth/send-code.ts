import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { getDb } from '../../../db';
import { verificationCodes } from '../../../db/schema';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { email, purpose = 'register' } = await request.json();

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: '请输入有效邮箱' }), { status: 400 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const db = getDb(locals.runtime.env);

    await db
      .insert(verificationCodes)
      .values({
        email,
        code,
        purpose,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      })
      .run();

    const resend = new Resend(locals.runtime.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'SmallHome <noreply@smallhome.top>',
      to: email,
      subject: 'SmallHome 验证码 / Verification Code',
      html: `<p>您的验证码是: <strong>${code}</strong></p><p>5分钟内有效。</p><hr/><p>Your verification code is: <strong>${code}</strong></p><p>Valid for 5 minutes.</p>`,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Send code error:', err);
    return new Response(JSON.stringify({ error: '发送验证码失败' }), { status: 500 });
  }
};