import type { APIRoute } from 'astro';
import { getDb } from '../../../db';
import { submittedArticles } from '../../../db/schema';
import { requireRole } from '../../../middleware/auth';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const payload = requireRole(request, ['editor', 'admin'], locals.runtime.env.JWT_SECRET || 'smallhome-dev-secret');
    const { id, reason } = await request.json();

    if (!id) {
      return new Response(JSON.stringify({ error: '缺少文章ID' }), { status: 400 });
    }

    if (!reason || reason.trim().length === 0) {
      return new Response(JSON.stringify({ error: '请填写驳回理由' }), { status: 400 });
    }

    const db = getDb(locals.runtime.env);

    const existing = await db
      .select()
      .from(submittedArticles)
      .where(eq(submittedArticles.id, id))
      .all();

    if (existing.length === 0) {
      return new Response(JSON.stringify({ error: '文章不存在' }), { status: 404 });
    }

    if (existing[0].status !== 'pending') {
      return new Response(JSON.stringify({ error: '只能审核待审核状态的文章' }), { status: 400 });
    }

    await db
      .update(submittedArticles)
      .set({
        status: 'rejected',
        reviewComment: reason.trim(),
        reviewedBy: payload.sub,
        reviewedAt: new Date().toISOString(),
      })
      .where(eq(submittedArticles.id, id))
      .run();

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      const e = err as { status: number; message: string };
      return new Response(JSON.stringify({ error: e.message }), { status: e.status });
    }
    console.error('Reject error:', err);
    return new Response(JSON.stringify({ error: '驳回失败' }), { status: 500 });
  }
};