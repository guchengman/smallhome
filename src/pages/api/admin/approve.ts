import type { APIRoute } from 'astro';
import { getDb } from '../../../db';
import { submittedArticles } from '../../../db/schema';
import { requireRole } from '../../../middleware/auth';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const payload = requireRole(request, ['editor', 'admin'], locals.runtime.env.JWT_SECRET || 'smallhome-dev-secret');
    const { id } = await request.json();

    if (!id) {
      return new Response(JSON.stringify({ error: '缺少文章ID' }), { status: 400 });
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

    // Generate slug if not present
    let slug = existing[0].slug;
    if (!slug) {
      slug = existing[0].title
        .toLowerCase()
        .replace(/[^a-z0-9一-鿿]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 80);
    }

    await db
      .update(submittedArticles)
      .set({
        status: 'published',
        slug,
        reviewedBy: payload.sub,
        reviewedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
      })
      .where(eq(submittedArticles.id, id))
      .run();

    return new Response(
      JSON.stringify({ success: true, slug }),
      { status: 200 },
    );
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      const e = err as { status: number; message: string };
      return new Response(JSON.stringify({ error: e.message }), { status: e.status });
    }
    console.error('Approve error:', err);
    return new Response(JSON.stringify({ error: '审核失败' }), { status: 500 });
  }
};