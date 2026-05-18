export interface ImportResult {
  title: string;
  description: string;
  contentMd: string;
  category: string;
  tags: string[];
  coverImage?: string;
}

export async function importFromUrl(url: string): Promise<ImportResult> {
  try {
    const res = await fetch(url);
    const html = await res.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch?.[1]?.trim() || '未命名文章';

    // Extract description
    const descMatch = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i)
      || html.match(/<meta[^>]+content="([^"]+)"[^>]+name="description"/i);
    const description = descMatch?.[1]?.slice(0, 160) || '';

    // Very basic content extraction (in production, use cheerio/linkedom)
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    let content = bodyMatch?.[1] || '';
    // Strip HTML tags for basic Markdown
    content = content
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
      .slice(0, 50000);

    return {
      title,
      description,
      contentMd: content,
      category: 'tips',
      tags: [],
      coverImage: undefined,
    };
  } catch (err) {
    throw new Error(`导入失败: ${err instanceof Error ? err.message : '未知错误'}`);
  }
}

export function detectCategory(title: string): string {
  const lower = title.toLowerCase();
  if (/厨房|kitchen|cook/.test(lower)) return 'space';
  if (/卫生间|浴室|bathroom|bath/.test(lower)) return 'space';
  if (/客厅|living/.test(lower)) return 'space';
  if (/卧室|bedroom/.test(lower)) return 'space';
  if (/阳台|balcony/.test(lower)) return 'space';
  if (/㎡|平米|sqm|sq.?ft|面积/.test(lower)) return 'area';
  if (/预算|budget|元|万元|cost/.test(lower)) return 'budget';
  if (/北欧|日式|简约|工业风|奶油|nordic|japanese|modern|industrial/.test(lower)) return 'style';
  if (/避坑|陷阱|骗局|合同|陷阱|trap|scam|contract/.test(lower)) return 'tips';
  return 'gallery';
}