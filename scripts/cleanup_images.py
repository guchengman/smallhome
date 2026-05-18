"""Clean up WeChat article images: remove #imgIndex suffixes and fix references."""
import os, re

images_dir = 'public/images/articles'
articles_dir = 'src/content/articles/zh'

# Step 1: Clean up filenames with #imgIndex
print("=== Step 1: Cleaning up #imgIndex filenames ===")
removed = 0
renamed = 0
for f in os.listdir(images_dir):
    if '#' in f:
        new_name = re.sub(r'#.*$', '', f)
        old_path = os.path.join(images_dir, f)
        new_path = os.path.join(images_dir, new_name)
        if os.path.exists(new_path):
            os.remove(old_path)
            removed += 1
            print(f"  REMOVED (duplicate): {f}")
        else:
            os.rename(old_path, new_path)
            renamed += 1
            print(f"  RENAMED: {f} -> {new_name}")
print(f"  Total: removed={removed}, renamed={renamed}")

# Step 2: Remove #imgIndex=N from markdown files
print("\n=== Step 2: Cleaning #imgIndex refs in markdown ===")
for f in os.listdir(articles_dir):
    if not f.startswith('wechat-') or not f.endswith('.md'):
        continue
    path = os.path.join(articles_dir, f)
    content = open(path, encoding='utf-8').read()
    cleaned = re.sub(r'#imgIndex=\d+', '', content)
    if cleaned != content:
        open(path, 'w', encoding='utf-8').write(cleaned)
        print(f"  CLEANED: {f}")

# Step 3: Create img_001 copies for covers that articles reference
print("\n=== Step 3: Creating img_001 copies for cover references ===")
for f in os.listdir(images_dir):
    m = re.match(r'^(wechat-.+)_img_001\.(jpe?g|png|gif)$', f, re.I)
    if m:
        base = m.group(1)
        ext = m.group(2)
        cover_name = f"{base}.{ext}"
        cover_path = os.path.join(images_dir, cover_name)
        if not os.path.exists(cover_path):
            import shutil
            shutil.copy2(os.path.join(images_dir, f), cover_path)
            print(f"  COPIED: {f} -> {cover_name}")

# Step 4: Find and list small decorative images (< 100px)
print("\n=== Step 4: Checking for small decorative images ===")
try:
    from PIL import Image
    small_images = []
    for f in os.listdir(images_dir):
        fpath = os.path.join(images_dir, f)
        if not os.path.isfile(fpath):
            continue
        try:
            img = Image.open(fpath)
            w, h = img.size
            if w < 100 or h < 100:
                small_images.append((f, w, h))
        except:
            pass
    if small_images:
        for f, w, h in small_images:
            print(f"  SMALL: {f} ({w}x{h})")
        print(f"  Total small images: {len(small_images)}")
    else:
        print("  No small images found")
except ImportError:
    print("  Pillow not installed, skipping")

print("\n=== Done ===")
