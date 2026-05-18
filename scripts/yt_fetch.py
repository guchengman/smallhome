"""Fetch YouTube video metadata from video pages."""
import urllib.request
import urllib.parse
import json
import re
import sys

def fetch_video_info(video_id):
    """Fetch detailed video info from a YouTube video page."""
    url = f"https://www.youtube.com/watch?v={video_id}"
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
    html = urllib.request.urlopen(req, timeout=15).read().decode('utf-8', errors='replace')

    # Extract ytInitialPlayerResponse
    m = re.search(r'ytInitialPlayerResponse\s*=\s*({.+?});', html)
    if not m:
        return None

    try:
        data = json.loads(m.group(1))
    except json.JSONDecodeError as e:
        return None

    # Try to find videoDetails - it may be nested
    vd = None
    for key in ['videoDetails']:
        if key in data:
            vd = data[key]
            break

    if not vd:
        # Check in microformat or other paths
        for path in ['playerResponse', 'microformat', 'player']:
            if path in data and isinstance(data[path], dict) and 'videoDetails' in data[path]:
                vd = data[path]['videoDetails']
                break

    if not vd:
        return None

    title = vd.get('title', '')
    author = vd.get('author', '')
    length = vd.get('lengthSeconds', '')
    views = vd.get('viewCount', '')
    description = vd.get('shortDescription', '')[:1000]
    channel_id = vd.get('channelId', '')

    # Get best thumbnail
    thumbnails = vd.get('thumbnail', {}).get('thumbnails', [])
    cover = thumbnails[-1].get('url', '') if thumbnails else ''

    # Also try to get captions info
    captions_available = False
    try:
        if 'captions' in data:
            captions_available = True
    except:
        pass

    return {
        'video_id': video_id,
        'title': title,
        'author': author,
        'channel_id': channel_id,
        'length_seconds': length,
        'view_count': views,
        'description': description,
        'cover_url': cover,
        'captions_available': captions_available,
    }

def search_videos(query, max_results=20):
    """Search YouTube using the search page."""
    encoded = urllib.parse.quote(query)
    url = f"https://www.youtube.com/results?search_query={encoded}"
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
    html = urllib.request.urlopen(req, timeout=15).read().decode('utf-8', errors='replace')

    # Extract ytInitialData
    m = re.search(r'var ytInitialData\s*=\s*({.+?});', html)
    if not m:
        m = re.search(r'ytInitialData\s*=\s*({.+?});', html)

    if not m:
        print("Could not find ytInitialData", file=sys.stderr)
        return []

    try:
        data = json.loads(m.group(1))
    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}", file=sys.stderr)
        return []

    # Navigate to video items
    videos = []
    try:
        contents = data['contents']['twoColumnSearchResultsRenderer']['primaryContents']['sectionListRenderer']['contents']
        for section in contents:
            if 'itemSectionRenderer' in section:
                items = section['itemSectionRenderer']['contents']
                for item in items:
                    if 'videoRenderer' in item:
                        vr = item['videoRenderer']
                        vid = vr.get('videoId', '')
                        title = vr.get('title', {}).get('runs', [{}])[0].get('text', '')
                        channel = vr.get('longBylineText', {}).get('runs', [{}])[0].get('text', '')
                        views = vr.get('viewCountText', {}).get('simpleText', '')
                        length = vr.get('lengthText', {}).get('simpleText', '')
                        # Thumbnail
                        thumbs = vr.get('thumbnail', {}).get('thumbnails', [])
                        cover = thumbs[-1].get('url', '') if thumbs else ''

                        videos.append({
                            'video_id': vid,
                            'title': title,
                            'author': channel,
                            'view_count': views,
                            'length': length,
                            'cover_url': cover,
                        })

                        if len(videos) >= max_results:
                            return videos
    except KeyError as e:
        print(f"Data structure error: {e}", file=sys.stderr)

    return videos

if __name__ == '__main__':
    mode = sys.argv[1] if len(sys.argv) > 1 else 'search'

    if mode == 'search':
        query = sys.argv[2] if len(sys.argv) > 2 else "小户型装修"
        results = search_videos(query, 20)
        safe_query = re.sub(r'[^\w]', '_', query)[:30]
        with open(f'youtube_{safe_query}.json', 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        print(f"Saved {len(results)} results to youtube_results.json")
    elif mode == 'info':
        vid = sys.argv[3] if len(sys.argv) > 3 else 'RkGtvhBnAm0'
        info = fetch_video_info(vid)
        if info:
            with open(f'youtube_{vid}_info.json', 'w', encoding='utf-8') as f:
                json.dump(info, f, ensure_ascii=False, indent=2)
            print(f"Saved info for {vid} to youtube_{vid}_info.json")
