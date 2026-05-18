import type { APIRoute } from 'astro';
import { getDb } from '../../../db';
import { submittedArticles } from '../../../db/schema';
import { requireAuth } from '../../../middleware/auth';
import { eq, and } from 'drizzle-orm';

// Save draft (create or update)
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const payload = requireAuth(request, locals.runtime.env.JWT_SECRET || 'smallhome-dev-secret');
    const { id, title, description, contentMd, category, tags, coverImage, locale } = await request.json();

    const db = getDb(locals.runtime.env);

    if (id) {
      // Update existing draft
      const existing = await db
        .select()
        .from(submittedArticles)
        .where(and(eq(submittedArticles.id, id), eq(submittedArticles.userId, payload.sub)))
        .all();

      if (existing.length === 0) {
        return new Response(JSON.stringify({ error: '草稿不存在' }), { status: 404 });
      }

      await db
        .update(submittedArticles)
        .set({
          title: title || existing[0].title,
          description: description || existing[0].description,
          contentMd: contentMd || existing[0].contentMd,
          category: category || existing[0].category,
          tags: tags ? JSON.stringify(tags) : existing[0].tags,
          coverImage: coverImage !== undefined ? coverImage : existing[0].coverImage,
          locale: locale || existing[0].locale,
          status: 'draft',
        })
        .where(eq(submittedArticles.id, id))
        .run();

      return new Response(JSON.stringify({ id, status: 'draft' }), { status: 200 });
    }

    // Create new draft
    const result = await db
      .insert(submittedArticles)
      .values({
        userId: payload.sub,
        title: title || '无标题',
        description: description || '',
        contentMd: contentMd || '',
        category: category || 'area',
        tags: Array.isArray(tags) ? JSON.stringify(tags) : '[]',
        coverImage: coverImage || null,
        locale: locale || 'zh',
        status: 'draft',
      })
      .returning()
      .get();

    return new Response(JSON.stringify({ id: result.id, status: 'draft' }), { status: 201 });
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      const e = err as { status: number; message: string };
      return new Response(JSON.stringify({ error: e.message }), { status: e.status });
    }
    console.error('Save draft error:', err);
    return new Response(JSON.stringify({ error: '保存草稿失败' }), { status: 500 });
  }
};