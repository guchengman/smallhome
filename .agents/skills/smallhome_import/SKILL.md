---
name: smallhome_import
description: Import articles from Bilibili and Xiaohongshu into the SmallHome content system. Use this when the user wants to fetch renovation/home design articles from B站/小红书, download cover images, create markdown articles with proper multi-category classification, and integrate them into the Astro-based smallhome site. Triggers on requests like "从B站获取文章", "从小红书找文章", "导入装修文章", "fetch articles from B站/小红书", "更新文章到系统". Handles the full pipeline: content extraction → classification → cover download → file creation → build verification.
---

# Article Importer — SmallHome Content Pipeline

Import articles from Bilibili (B站) and Xiaohongshu (小红书) into the SmallHome Astro content system, with proper multi-category classification and cover image management.

## System Architecture

```
smallhome/
├── src/
│   ├── content/articles/     # ← Destination for imported articles
│   │   ├── zh/               # Chinese articles (markdown)
│   │   └── en/               # English articles (markdown)
│   └── content.config.ts     # Schema: categories[], tags[], etc.
├── public/images/articles/   # ← Cover images stored here
└── .agents/skills/smallhome_import/
    ├── SKILL.md              # This file
    └── scripts/              # Helper scripts
```

## Prerequisites

- **AutoCLI** — for Xiaohongshu search and reading (`autocli xiaohongshu search ...`, `autocli read ...`)
- **PowerShell 7+** — for running helper scripts (Windows)
- **Bilibili API** — public API at `https://api.bilibili.com/x/web-interface/view?bvid={BVid}`
- **sharp** (optional) — for generating custom cover images: `npx sharp`

## Content Schema (Frontmatter)

Each article file must use this frontmatter structure:

```yaml
---
title: "文章标题"
description: "摘要描述（建议60字以内）"
publishedAt: "2026-05-18"
categories: ["area"]           # ← Array of primary categories
tags: ["小户型", "收纳"]        # ← Array of keyword tags
coverImage: "/images/articles/slug.jpg"
author: "原作者名"
areaSize: "30-40sqm"           # ← Optional secondary: area range slug
room: "bedroom"                # ← Optional secondary: room slug
styleName: "nordic"            # ← Optional secondary: style slug
budgetRange: "30k-80k"         # ← Optional secondary: budget range slug
---
```

## Secondary Category System

Every article can optionally have one secondary category from each primary group.
These refine the primary categories for sub-page filtering.

| Field | Values | Display |
|-------|--------|---------|
| `areaSize` | `30-40sqm`, `40-50sqm`, `50-70sqm`, `70-90sqm` | 30-40㎡ etc. |
| `room` | `kitchen`, `bathroom`, `livingroom`, `bedroom`, `balcony`, `entryway` | 厨房, 卫生间 etc. |
| `styleName` | `nordic`, `japanese`, `modern`, `industrial`, `cream` | 北欧风, 日式 etc. |
| `budgetRange` | `under-30k`, `30k-80k`, `80k-150k`, `over-150k` | 3万以下, 3-8万 etc. |

**Rules:**
- Only set a secondary field when the article clearly matches that specific sub-category
- Articles without a secondary field appear on ALL sub-pages of that primary category
- Example: an article with `categories: ["area"]` but no `areaSize` appears on all 4 area pages
- Example: an article with `categories: ["area"]` and `areaSize: "30-40sqm"` only appears on the 30-40㎡ page
```

## Primary Category System

Every article gets one or more from these 5 primary categories:

| Category | Key | When to Use |
|----------|-----|-------------|
| 面积 | `area` | Article mentions specific apartment size (30㎡, 55㎡, etc.), or is about layout planning for a given square meterage |
| 空间 | `space` | Article focuses on specific rooms (kitchen, bathroom, bedroom), or is about space utilization/storage |
| 风格 | `style` | Article is about a design style (北欧风, 日式, 中古风, 奶油风, 现代简约, 复古风, etc.) |
| 预算 | `budget` | Article discusses costs, budget ranges, money-saving tips, or specific price points |
| 避坑指南 | `tips` | Article gives advice, warnings, how-to guides, contract tips, or renovation lessons |

**Classification rules:**
- Assign ALL categories that apply based on article CONTENT, not just the title
- If an article covers a 55㎡ apartment with 中古风 style and layout tips → `["area", "style", "tips"]`
- If an article is purely about storage techniques → `["space", "tips"]`
- If an article compares budget levels → `["budget", "tips"]`
- If an article is a photo gallery/tour → assign based on what it shows (e.g., `["style", "area"]` for a 30㎡北欧 tour)
- Most articles should get 1-3 categories. Avoid over-categorizing (use max 3 unless genuinely cross-cutting)

---

## Workflow A: Import from Bilibili

### Step 1: Get B站 video IDs

User provides BVids or you search B站. For search:

```powershell
autocli bilibili search --keyword "小户型装修" --limit 20 --format json
```

### Step 2: Fetch video metadata

Use the Bilibili API to get title, author, view count, and cover URL:

```powershell
$resp = Invoke-RestMethod -Uri "https://api.bilibili.com/x/web-interface/view?bvid=BV1xxx"
$data = $resp.data
# $data.title, $data.owner.name, $data.stat.view, $data.pic (cover URL)
```

Rate-limit: add `Start-Sleep -Milliseconds 300` between calls.

### Step 3: Generate article content

For each B站 video, write article content in Markdown. Include:

1. **Attribution line** at the top: `> 本文整理自B站UP主"{author}"的视频——{title}。`
2. **Well-structured body** with h2 sections, bullet points, and practical advice
3. **Content should be based on** the video title + description as a starting point, and your general knowledge of renovation/home design topics. Make it substantial (300-800 words).
4. **Match the category** — if it's about storage, write detailed storage tips. If it's about a style, describe the style's features.

Article quality guidelines:
- Write for Chinese readers interested in home renovation
- Use natural Chinese, not translation-ese
- Include specific measurements, prices, and actionable advice
- Use `##` for section headers, `###` for subsections
- Include at least 5 substantive sections, not fluff

### Step 4: Determine primary categories

Analyze the video title + description + your generated content to assign primary categories:
- Titles mentioning "㎡" are candidates for `area`
- Titles mentioning rooms (厨房, 卧室, 卫生间) or "收纳" are candidates for `space`
- Titles mentioning style names (北欧, 日式, 中古, 奶油, etc.) are candidates for `style`
- Titles mentioning prices/budgets are candidates for `budget`
- Advice/tips videos → `tips`

### Step 5: Determine secondary categories

Based on the same analysis, assign secondary category fields to refine the primary categories:

| Primary Category | Secondary Field | How to Determine |
|------------------|-----------------|-----------------|
| `area` | `areaSize` | Extract the exact sqm number from title/content. Map: <30 → omit, 30-39 → `30-40sqm`, 40-49 → `40-50sqm`, 50-69 → `50-70sqm`, 70-90 → `70-90sqm` |
| `space` | `room` | If the article focuses on a specific room: 厨房 → `kitchen`, 卫生间/浴室 → `bathroom`, 客厅 → `livingroom`, 卧室/次卧 → `bedroom`, 阳台 → `balcony`, 玄关 → `entryway`. Omit if general storage/space tips. |
| `style` | `styleName` | If a clear style is identifiable: 北欧/斯堪的纳维亚 → `nordic`, 日式/原木 → `japanese`, 现代简约/极简 → `modern`, 工业/loft → `industrial`, 奶油/法式 → `cream`. Omit if multiple styles or unclear. |
| `budget` | `budgetRange` | Extract the budget amount. Map: <3万 → `under-30k`, 3-8万 → `30k-80k`, 8-15万 → `80k-150k`, >15万 → `over-150k`. Omit if no specific amount. |

**Rules:**
- Only set a secondary field when the article CLEARLY matches a specific sub-category
- Articles without a secondary field appear on ALL sub-pages (graceful fallback)
- Example: `categories: ["area"]` + `areaSize: "40-50sqm"` → only shows on 40-50㎡ page
- Example: `categories: ["area"]` with no `areaSize` → shows on ALL area sub-pages

### Step 6: Create article file

Use the slug format: `bv{lowercase_bvid}.md` (e.g., `bv1qgvdzrei7.md`)

Write to `src/content/articles/zh/{slug}.md` with proper frontmatter.

### Step 6: Download cover image

Bilibili cover URLs look like: `http://i0.hdslb.com/bfs/archive/{hash}.jpg`

```powershell
$coverUrl = $data.pic  # URL from API
$ext = [System.IO.Path]::GetExtension($coverUrl.Split('?')[0])
if ([string]::IsNullOrEmpty($ext)) { $ext = ".jpg" }
Invoke-WebRequest -Uri $coverUrl -OutFile "public/images/articles/{slug}$ext"
```

---

## Workflow B: Import from Xiaohongshu

### Step 1: Search for articles

```powershell
autocli xiaohongshu search "小户型装修" --limit 20 --format json
```

Identify high-traffic articles (note the note ID from the search results).

### Step 2: Read article content

```powershell
autocli xiaohongshu download --url "https://www.xiaohongshu.com/explore/{NOTE_ID}"
```

Or use the generic reader:
```powershell
autocli read "https://www.xiaohongshu.com/explore/{NOTE_ID}" -f markdown
```

### Step 3: Extract cover image

Xiaohongshu note pages have og:image meta tags. Extract via curl:

```powershell
$html = curl -s -L -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" "https://www.xiaohongshu.com/explore/{NOTE_ID}"
$coverUrl = ($html | Select-String -Pattern '<meta[^>]*property="og:image"[^>]*content="([^"]+)"').Matches.Groups[1].Value
# Handle protocol-relative URLs (starting with //)
if ($coverUrl -match "^//") { $coverUrl = "https:$coverUrl" }
```

**Note**: Xiaohongshu CDN URLs are time-limited. Download immediately after fetching.

For video notes without a real cover image (the og:image is a 4KB Picasso icon), generate a custom cover instead (see Workflow D).

### Step 4: Determine primary categories

Same as Step 4 of Workflow A — analyze title + description + content.

### Step 5: Determine secondary categories

Same as Step 5 of Workflow A — assign `areaSize`, `room`, `styleName`, `budgetRange` based on content analysis.

### Step 6: Create article file

Use a descriptive English slug: `{description-topic}.md` (e.g., `44sqm-old-house-renovation.md`)

Write to `src/content/articles/zh/{slug}.md`.

### Step 7: Download/generate cover image

Save as `public/images/articles/{slug}.jpg` (1200×630px recommended).

---

## Workflow C: Batch Fetch from Bilibili (Script)

For bulk imports of 10+ B站 videos, use the bundled script:

```powershell
# 1. Edit the BVids array in scripts/fetch_bilibili.ps1
# 2. Run it to fetch metadata + save to CSV
pwsh .agents/skills/smallhome_import/scripts/fetch_bilibili.ps1
```

Then generate articles from the CSV:

```powershell
# Edit the article content templates in scripts/generate_articles.ps1
# Then run:
pwsh .agents/skills/smallhome_import/scripts/generate_articles.ps1
```

---

## Workflow D: Generate Custom Cover Image

When a video note lacks a proper cover image (e.g., Xiaohongshu video notes return a 4KB Picasso icon), generate a custom one using sharp + SVG:

```javascript
const sharp = require('sharp');

const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#2D1810"/>
      <stop offset="100%" stop-color="#6B4226"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <text x="60" y="280" font-family="sans-serif" font-size="52" font-weight="bold" fill="white">55㎡ 老破小 Room Tour</text>
  <text x="60" y="340" font-family="sans-serif" font-size="24" fill="#D4A574">轻体砖隔断 · 玻璃砖干区 · 墙垛拆改</text>
  <!-- Add abstract layout/design elements matching the article content -->
</svg>`;

sharp(Buffer.from(svg))
  .resize(1200, 630)
  .jpeg({ quality: 90 })
  .toFile('public/images/articles/{slug}.jpg');
```

**Design guidelines for generated covers:**
- Use a gradient background with colors matching the article's theme/style
- Add decorative geometric elements (abstract floor plans, grids, arches)
- Title in large bold font, subtitle in smaller lighter font
- Include relevant keywords from the article as subtitle
- Output: 1200×630 JPEG at quality 90

---

## Workflow E: Article Classification & System Update

After importing new articles or reclassifying existing ones:

### 1. Update article frontmatter

Each article should have `categories` as an array and optionally secondary fields:

```yaml
# Before (old single category)
category: "area"

# After (new multi-category + secondary fields)
categories: ["area", "space", "tips"]
areaSize: "50-70sqm"
room: "bedroom"
```

### 2. Verify the schema

The content collection schema at `src/content.config.ts` expects:
```ts
categories: z.array(z.string()).optional()
areaSize: z.string().optional(),
room: z.string().optional(),
styleName: z.string().optional(),
budgetRange: z.string().optional(),
```

### 3. Build verification

Always run the build to catch errors:

```powershell
npx astro build
```

Check for:
- Schema validation errors (e.g., an article still using old `category` field)
- Missing cover images (check the output for 404 warnings)
- Proper filtering on category listing pages

### 4. Category page behavior

The pages filter by `categories.includes()`:
- `/zh/area/[size]` → shows articles where categories includes `"area"`
- `/zh/space/[room]` → shows articles where categories includes `"space"`
- `/zh/style/[styleName]` → shows articles where categories includes `"style"`
- `/zh/budget/[range]` → shows articles where categories includes `"budget"`
- `/zh/tips` → shows articles where categories includes `"tips"`

The article detail page shows all categories as tag badges.

---

## File Reference

### Where to write:

| Asset | Path |
|-------|------|
| Chinese articles | `src/content/articles/zh/{slug}.md` |
| English articles | `src/content/articles/en/{slug}.md` |
| Cover images | `public/images/articles/{slug}.jpg` |
| B站 CSV data | `bilibili_videos.csv` (project root, optional) |

### Slug naming conventions:

| Source | Slug Pattern | Example |
|--------|-------------|---------|
| B站 video | `bv{lowercase_bvid}` | `bv1qgvdzrei7.md` |
| 小红书 article | `{sqm}-{topic}-{descriptor}` | `44sqm-old-house-renovation.md` |
| Original article | `{topic-slug}` | `japandi-storage.md` |

---

## Verification Checklist

After import, verify:

- [ ] All articles have valid `categories` array (not the old `category` string)
- [ ] Secondary category fields (`areaSize`, `room`, `styleName`, `budgetRange`) are set when applicable
- [ ] Cover images exist at the specified paths and are ≥ 4KB
- [ ] `npx astro build` passes without errors
- [ ] Category listing pages show correct article counts and secondary filtering works
- [ ] Article detail page displays all category tags (primary + secondary badges)
