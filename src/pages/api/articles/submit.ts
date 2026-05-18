import type { APIRoute } from 'astro';
import { getDb } from '../../../db';
import { submittedArticles } from '../../../db/schema';
import { requireAuth } from '../../../middleware/auth';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const payload = requireAuth(request, locals.runtime.env.JWT_SECRET || 'smallhome-dev-secret');
    const { title, description, contentMd, category, tags, coverImage, locale, slug, status } = await request.json();

    if (!title || !description || !contentMd || !category) {
      return new Response(JSON.stringify({ error: '请填写标题、摘要、正文和分类' }), { status: 400 });
    }

    if (description.length > 160) {
      return new Response(JSON.stringify({ error: '摘要不能超过160字' }), { status: 400 });
    }

    const validCategories = ['area', 'space', 'style', 'budget', 'tips', 'gallery'];
    if (!validCategories.includes(category)) {
      return new Response(JSON.stringify({ error: '无效的分类' }), { status: 400 });
    }

    const db = getDb(locals.runtime.env);

    const values: typeof submittedArticles.$inferInsert = {
      userId: payload.sub,
      title,
      description,
      contentMd,
      category,
      tags: Array.isArray(tags) ? JSON.stringify(tags) : (tags || '[]'),
      coverImage: coverImage || null,
      locale: locale || 'zh',
      status: status || 'pending',
    };

    if (slug) values.slug = slug;

    const result = await db.insert(submittedArticles).values(values).returning().get();

    return new Response(
      JSON.stringify({ id: result.id, status: result.status }),
      { status: 201 },
    );
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      const e = err as { status: number; message: string };
      return new Response(JSON.stringify({ error: e.message }), { status: e.status });
    }
    console.error('Submit article error:', err);
    return new Response(JSON.stringify({ error: '提交失败' }), { status: 500 });
  }
};