"""Import YouTube videos as SmallHome articles.

Fetches video info from YouTube, downloads covers, creates articles.
Usage: python scripts/import_youtube.py
"""

import urllib.request
import json
import re
import os
import time

OUTPUT_DIR = "src/content/articles/zh"
IMAGE_DIR = "public/images/articles"

# 20 selected videos about small home renovation
VIDEOS = [
    # Chinese language videos
    {"vid": "P49fcRHGLPI", "slug": "yt-48sqm-limit-storage"},
    {"vid": "6tr0WKGybPQ", "slug": "yt-45sqm-tokyo-roomtour"},
    {"vid": "XoAZwoDagcE", "slug": "yt-1ping-storage-room"},
    {"vid": "iJTSwSiYrfw", "slug": "yt-30sqm-open-storage"},
    {"vid": "aLS2nU8UFYE", "slug": "yt-small-home-storage-tips"},
    {"vid": "Ye3MLV_36V8", "slug": "yt-56sqm-designer-self"},
    {"vid": "2YWvIlEDTKQ", "slug": "yt-4-tricks-50sqm"},
    {"vid": "JsM2-Bg833w", "slug": "yt-small-kitchen-storage"},
    # English/international videos
    {"vid": "daL7TkzyW7k", "slug": "yt-24sqm-micro-apartment"},
    {"vid": "X_-Q1hOYeCo", "slug": "yt-650sqft-nyc-designer"},
    {"vid": "idQIA8x8Cxk", "slug": "yt-46sqm-berlin-heritage"},
    {"vid": "QhOfGCil5cY", "slug": "yt-40sqm-london-colorful"},
    {"vid": "FBJJMJf7gBU", "slug": "yt-60sqm-spain-ikea-hacks"},
    {"vid": "kgJs_M2MHIQ", "slug": "yt-55sqm-melbourne-flex"},
    {"vid": "uHzP1r8JGv8", "slug": "yt-400sqft-nyc-architect"},
    {"vid": "Fy6kFu9i8Ew", "slug": "yt-190sqft-studio-makeover"},
    {"vid": "kOfq-a4netk", "slug": "yt-600sqft-nyc-eclectic"},
    {"vid": "Z3tHzt6s_Ic", "slug": "yt-parisian-flat-flexible"},
    {"vid": "wvPLWxYVrdA", "slug": "yt-small-flat-spacious-lux"},
    {"vid": "l6UcNHZ1h4Y", "slug": "yt-small-space-big-family"},
]

def fetch_video_info(video_id):
    """Fetch video metadata from YouTube page."""
    url = f"https://www.youtube.com/watch?v={video_id}"
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
    html = urllib.request.urlopen(req, timeout=15).read().decode('utf-8', errors='replace')

    m = re.search(r'ytInitialPlayerResponse\s*=\s*({.+?});', html)
    if not m:
        return None

    data = json.loads(m.group(1))
    vd = data.get('videoDetails')
    if not vd:
        return None

    title = vd.get('title', '')
    author = vd.get('author', '')
    length = vd.get('lengthSeconds', '')
    views = vd.get('viewCount', '')
    description = vd.get('shortDescription', '')[:1000]
    channel_id = vd.get('channelId', '')

    # Best thumbnail
    thumbs = vd.get('thumbnail', {}).get('thumbnails', [])
    cover = thumbs[-1].get('url', '') if thumbs else ''

    return {
        'video_id': video_id, 'title': title, 'author': author,
        'channel_id': channel_id, 'length_seconds': length,
        'view_count': views, 'description': description, 'cover_url': cover,
    }


def download_cover(cover_url, slug):
    """Download cover image from YouTube thumbnail URL."""
    ext = ".jpg"
    if cover_url:
        try:
            req = urllib.request.Request(cover_url, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            })
            data = urllib.request.urlopen(req, timeout=15).read()
            path = os.path.join(IMAGE_DIR, f"{slug}{ext}")
            with open(path, 'wb') as f:
                f.write(data)
            return f"/images/articles/{slug}{ext}"
        except Exception as e:
            print(f"  Cover download failed: {e}")
    return ""


def slugify_title(title):
    """Create an English slug from a Chinese/English title."""
    s = title.lower()
    s = re.sub(r'[^\w一-鿿]+', '-', s)
    s = s.strip('-')
    return s[:60]


# Article content templates keyed by slug
def get_article_content(info, slug):
    """Generate article content based on video info."""
    title = info['title']
    author = info['author']
    desc = info.get('description', '')
    vid = info['video_id']
    views = info.get('view_count', '')

    return f"""## 视频简介

本文内容整理自YouTube频道 **{author}** 的视频《{title}》。

{desc[:500]}

## 设计亮点

### 空间布局

这个案例展示了小户型空间布局的巧妙思路。通过合理划分功能区域，让有限的空间发挥最大效用。设计师在布局上采用了开放式设计，减少隔断带来的压抑感，同时利用多功能家具来实现空间的灵活转换。

### 收纳设计

收纳是小户型装修的核心挑战。这个案例在收纳方面做了精心规划——利用墙面空间、定制嵌入式柜体、选择多功能家具等方式，在不影响美观的前提下大幅提升了储物能力。

### 色彩与材质

色彩搭配上采用了浅色系为主、局部点缀亮色的方案，让空间显得更加开阔明亮。材质选择上注重质感与实用性的平衡，既营造了温馨舒适的居住氛围，又确保了日常使用的耐久性。

### 灯光设计

灯光采用了多层次照明方案——主灯提供基础照明，射灯和灯带补充重点区域照明，落地灯和台灯营造氛围。合理的灯光设计让整个空间层次丰富、氛围温馨。

## 借鉴要点

1. **开放式布局**：减少非必要隔断，让视线通透
2. **嵌入式收纳**：利用墙体空间，不占地面面积
3. **浅色系主调**：白色、米色、浅灰等色彩让空间显大
4. **多功能家具**：一物多用，节省空间
5. **垂直空间利用**：墙面搁板、吊柜等向上要空间

> 📺 观看完整视频：https://www.youtube.com/watch?v={vid}
"""


def categorize(info, slug):
    """Determine categories, tags, description based on video content."""
    title = info['title']
    desc = info.get('description', '')
    combined = (title + ' ' + desc).lower()

    cats = ["area"]
    tags = ["小户型", "装修"]
    area_size = ""
    room = ""
    style_name = ""
    budget_range = ""

    # Detect area size
    sqm_patterns = [
        (r'24\s*sqm', 'under-30k'),
        (r'30\s*m', '30-40sqm'),
        (r'4[0-9]\s*sqm', '40-50sqm'),
        (r'5[0-9]\s*sqm', '50-70sqm'),
        (r'6[0-9]\s*sqm', '50-70sqm'),
        (r'7[0-9]\s*sqm', '70-90sqm'),
        (r'8[0-9]\s*sqm', '70-90sqm'),
        (r'190\s*sq', 'under-30k'),
        (r'400\s*sq', '30-40sqm'),
        (r'550\s*sq', '50-70sqm'),
        (r'600\s*sq', '50-70sqm'),
        (r'650\s*sq', '50-70sqm'),
        (r'50[㎡米]', '50-70sqm'),
        (r'45[㎡米]', '40-50sqm'),
        (r'48[㎡米]', '40-50sqm'),
        (r'46[㎡米]', '40-50sqm'),
        (r'56[㎡米]', '50-70sqm'),
        (r'55[㎡米]', '50-70sqm'),
        (r'40[㎡米]', '40-50sqm'),
        (r'30[㎡米]', '30-40sqm'),
        (r'24[㎡米]', 'under-30k'),
        (r'16[㎡米]', 'under-30k'),
    ]

    for pat, val in sqm_patterns:
        if re.search(pat, combined):
            area_size = val
            break

    # Detect room focus
    if any(k in combined for k in ['kitchen', '厨房', 'kitchen']):
        cats.append("space")
        room = "kitchen"
        tags.extend(["厨房", "厨房收纳"])
    if any(k in combined for k in ['bathroom', '卫生间']):
        room = "bathroom"
    if any(k in combined for k in ['bedroom', '卧室']):
        room = "bedroom"
    if any(k in combined for k in ['living', '客厅', 'living']):
        room = "livingroom"
    if any(k in combined for k in ['storage', '收纳', 'storage', 'organiz']):
        cats.append("space")
        if 'tips' not in cats:
            cats.append("tips")
        tags.extend(["收纳", "收纳技巧"])
    if any(k in combined for k in ['small space', '小户型', 'tiny']):
        tags.append("小空间")
    if any(k in combined for k in ['design', '设计', '改造']):
        tags.append("空间设计")

    # Detect style
    if any(k in combined for k in ['nordic', '北欧', 'scandi']):
        style_name = "nordic"
        tags.append("北欧风")
    if any(k in combined for k in ['japanese', '日式', 'japandi']):
        style_name = "japanese"
        tags.append("日式")
    if any(k in combined for k in ['modern', '现代', '简约']):
        style_name = "modern"
        tags.append("现代简约")
    if any(k in combined for k in ['industrial', '工业']):
        style_name = "industrial"
    if any(k in combined for k in ['cream', '奶油', 'french']):
        style_name = "cream"

    # Detect tips category
    if any(k in combined for k in ['tips', '技巧', '攻略', 'how to', 'guide']):
        if 'tips' not in cats:
            cats.append("tips")
        tags.append("装修技巧")

    # Detect budget
    if any(k in combined for k in ['budget', '预算', 'cost', '价格', '20万', 'afford']):
        if 'budget' not in cats:
            cats.append("budget")
        tags.append("预算")

    # Generate description
    channel_name = info.get('author', 'YouTube')
    sqm_info = f"{re.search(r'(\d+)[㎡米sqm]', title)}" if re.search(r'(\d+)[㎡米sqm]', title) else ""
    desc_text = f"YouTube热门{channel_name}视频：{title[:50]}"

    # Deduplicate categories and tags
    cats = list(dict.fromkeys(cats))
    tags = list(dict.fromkeys(tags))

    return {
        'categories': cats,
        'tags': tags,
        'description': desc_text,
        'areaSize': area_size,
        'room': room,
        'styleName': style_name,
        'budgetRange': budget_range,
    }


def create_article(info, slug):
    """Create the article markdown file."""
    cat_info = categorize(info, slug)
    today = time.strftime("%Y-%m-%d")

    # Determine cover image path
    cover_path = download_cover(info.get('cover_url', ''), slug)

    # Build categories string
    cats_str = ', '.join(f'"{c}"' for c in cat_info['categories'])
    tags_str = ', '.join(f'"{t}"' for t in cat_info['tags'])

    # Secondary fields (only include non-empty)
    secondary = ""
    for field in ['areaSize', 'room', 'styleName', 'budgetRange']:
        if cat_info.get(field):
            secondary += f"{field}: \"{cat_info[field]}\"\n"

    content = get_article_content(info, slug)

    article = f"""---
title: "{info['title']}"
description: "{cat_info['description']}"
publishedAt: "{today}"
categories: [{cats_str}]
tags: [{tags_str}]
coverImage: "{cover_path}"
author: "{info['author']}"
{secondary}---

{content}
"""

    path = os.path.join(OUTPUT_DIR, f"{slug}.md")
    with open(path, 'w', encoding='utf-8') as f:
        f.write(article)
    print(f"  Created: {slug}.md")
    return path


def main():
    os.makedirs(IMAGE_DIR, exist_ok=True)
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    results = []
    for i, v in enumerate(VIDEOS):
        print(f"\n[{i+1}/{len(VIDEOS)}] Fetching {v['vid']}...")
        info = fetch_video_info(v['vid'])
        if not info:
            print(f"  FAILED to fetch {v['vid']}")
            # Create article anyway using just the slug info
            info = {
                'video_id': v['vid'],
                'title': v['slug'].replace('-', ' ').title(),
                'author': 'YouTube',
                'description': '',
                'cover_url': f"https://i.ytimg.com/vi/{v['vid']}/hqdefault.jpg",
                'view_count': '',
            }
            cover_path = download_cover(info['cover_url'], v['slug'])
            info['cover_url'] = cover_path

        print(f"  Title: {info.get('title', 'N/A')[:60]}")
        print(f"  Author: {info.get('author', 'N/A')}")
        create_article(info, v['slug'])
        results.append(info)
        time.sleep(0.5)  # Rate limit

    print(f"\nDone! Created {len(results)} articles.")
    return results


if __name__ == '__main__':
    main()
