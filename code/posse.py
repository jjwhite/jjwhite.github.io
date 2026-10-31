import os
import re
import sys
import json
import yaml
import argparse
from datetime import datetime, timezone
import urllib.request
import urllib.error
import urllib.parse

def load_env():
    """Load configuration from .env file or environment variables."""
    config = {}
    
    # Locations to check for .env
    possible_paths = [
        os.path.join(os.path.dirname(__file__), '.env'),
        os.path.join(os.path.dirname(__file__), '..', '.env'),
        '.env'
    ]
    
    for path in possible_paths:
        if os.path.isfile(path):
            with open(path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith('#'):
                        continue
                    if '=' in line:
                        key, val = line.split('=', 1)
                        config[key.strip()] = val.strip().strip('"').strip("'")
            break

    # Environment variables override .env
    for key in ['SITE_URL', 'MASTODON_INSTANCE', 'MASTODON_ACCESS_TOKEN', 'BLUESKY_HANDLE', 'BLUESKY_APP_PASSWORD']:
        if key in os.environ:
            config[key] = os.environ[key]
            
    # Set defaults
    if 'SITE_URL' not in config:
        config['SITE_URL'] = 'https://jonwhite.me'
        
    return config

def markdown_to_plain_text(md_content):
    """Strip markdown syntax to create clean plain text suitable for microblogging."""
    text = md_content
    # Remove image markdown: ![alt](url)
    text = re.sub(r'!\[.*?\]\(.*?\)', '', text)
    # Convert markdown links [text](url) -> text (url)
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'\1 (\2)', text)
    # Remove headers: # Header
    text = re.sub(r'^#+\s*', '', text, flags=re.MULTILINE)
    # Remove bold/italic: **text**, *text*, __text__, _text_
    text = re.sub(r'(\*\*|__)(.*?)\1', r'\2', text)
    text = re.sub(r'(\*|_)(.*?)\1', r'\2', text)
    # Remove inline code `code`
    text = re.sub(r'`([^`]+)`', r'\1', text)
    # Remove blockquotes >
    text = re.sub(r'^>\s*', '', text, flags=re.MULTILINE)
    # Collapse multiple blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def prepare_post_text(note_plain_text, canonical_url, max_chars=300):
    """
    Format status text appending canonical link, truncating gracefully if limit exceeded.
    """
    link_suffix = f"\n\n{canonical_url}"
    max_body_chars = max_chars - len(link_suffix)
    
    if len(note_plain_text) <= max_body_chars:
        return note_plain_text + link_suffix
    
    # Needs truncation
    truncated = note_plain_text[:max_body_chars - 3]
    last_space = truncated.rfind(' ')
    if last_space > 0 and (max_body_chars - last_space) < 30:
        truncated = truncated[:last_space]
    
    return truncated.rstrip() + '...' + link_suffix

def post_to_mastodon(instance, access_token, text):
    """Publish a status to Mastodon instance."""
    instance = instance.replace('https://', '').replace('http://', '').strip('/')
    url = f"https://{instance}/api/v1/statuses"
    
    payload = json.dumps({
        'status': text,
        'visibility': 'public'
    }).encode('utf-8')
    
    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json; charset=utf-8',
            'User-Agent': 'JonWhitePOSSE/1.0'
        },
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return data.get('url') or f"https://{instance}/@{data.get('account', {}).get('acct')}/{data.get('id')}"
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8', errors='ignore')
        raise RuntimeError(f"Mastodon API error {e.code}: {error_body}")

def get_bluesky_facets(text, link_url):
    """Generate ATProto facets for links with UTF-8 byte indices."""
    facets = []
    text_bytes = text.encode('utf-8')
    link_bytes = link_url.encode('utf-8')
    
    start = text_bytes.find(link_bytes)
    if start != -1:
        end = start + len(link_bytes)
        facets.append({
            "$type": "app.bsky.richtext.facet",
            "index": {
                "byteStart": start,
                "byteEnd": end
            },
            "features": [
                {
                    "$type": "app.bsky.richtext.facet#link",
                    "uri": link_url
                }
            ]
        })
    return facets

def post_to_bluesky(handle, app_password, text, canonical_url):
    """Publish a post to Bluesky using AT Protocol."""
    # 1. Create session
    session_url = "https://bsky.social/xrpc/com.atproto.server.createSession"
    session_payload = json.dumps({
        "identifier": handle,
        "password": app_password
    }).encode('utf-8')
    
    req = urllib.request.Request(
        session_url,
        data=session_payload,
        headers={'Content-Type': 'application/json; charset=utf-8'},
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(req) as resp:
            session_data = json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8', errors='ignore')
        raise RuntimeError(f"Bluesky session authentication failed ({e.code}): {error_body}")
    
    access_jwt = session_data['accessJwt']
    did = session_data['did']
    resolved_handle = session_data.get('handle', handle)
    
    # 2. Create post record
    now_iso = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.%fZ')
    facets = get_bluesky_facets(text, canonical_url)
    
    record = {
        "$type": "app.bsky.feed.post",
        "text": text,
        "createdAt": now_iso
    }
    if facets:
        record["facets"] = facets
        
    post_payload = json.dumps({
        "repo": did,
        "collection": "app.bsky.feed.post",
        "record": record
    }).encode('utf-8')
    
    post_url = "https://bsky.social/xrpc/com.atproto.repo.createRecord"
    post_req = urllib.request.Request(
        post_url,
        data=post_payload,
        headers={
            'Authorization': f'Bearer {access_jwt}',
            'Content-Type': 'application/json; charset=utf-8'
        },
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(post_req) as resp:
            post_data = json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8', errors='ignore')
        raise RuntimeError(f"Bluesky post creation failed ({e.code}): {error_body}")
    
    uri = post_data.get('uri', '')
    rkey = uri.split('/')[-1] if uri else ''
    return f"https://bsky.app/profile/{resolved_handle}/post/{rkey}"

def parse_markdown_file(file_path):
    """Read markdown file and split frontmatter and body."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n(.*)$', content, re.DOTALL)
    if match:
        yaml_content = match.group(1)
        body = match.group(2)
        front_matter = yaml.safe_load(yaml_content) or {}
    else:
        front_matter = {}
        body = content
        
    return front_matter, body

def save_markdown_file(file_path, front_matter, body):
    """Write updated frontmatter and body back to markdown file."""
    # Convert frontmatter to YAML string
    yaml_str = yaml.dump(front_matter, sort_keys=False, allow_unicode=True).strip()
    new_content = f"---\n{yaml_str}\n---\n\n{body.lstrip()}"
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

def syndicate_notes(notes_dir=None, dry_run=False):
    """
    Syndicate notes in notes_dir that haven't been syndicated yet.
    Returns summary dict of results.
    """
    config = load_env()
    
    if notes_dir is None:
        notes_dir = os.path.join(os.path.dirname(__file__), '..', 'src', 'notes')
    
    if not os.path.isdir(notes_dir):
        print(f"Notes directory '{notes_dir}' does not exist.")
        return {'processed': 0, 'syndicated': 0}
        
    mastodon_ready = bool(config.get('MASTODON_INSTANCE') and config.get('MASTODON_ACCESS_TOKEN'))
    bluesky_ready = bool(config.get('BLUESKY_HANDLE') and config.get('BLUESKY_APP_PASSWORD'))
    
    print("\n--- POSSE Syndication ---")
    print(f"Target directory: {os.path.abspath(notes_dir)}")
    print(f"Mastodon configured: {'Yes (' + config.get('MASTODON_INSTANCE', '') + ')' if mastodon_ready else 'No (missing instance or token)'}")
    print(f"Bluesky configured:  {'Yes (' + config.get('BLUESKY_HANDLE', '') + ')' if bluesky_ready else 'No (missing handle or app password)'}")
    if dry_run:
        print("[DRY RUN MODE ENABLED: No external network requests will be made]\n")
        
    if not mastodon_ready and not bluesky_ready and not dry_run:
        print("\nNo social credentials configured. To enable syndication, create 'code/.env' with your credentials.")
        print("See 'code/.env.example' for instructions.")
        return {'processed': 0, 'syndicated': 0}

    note_files = sorted([f for f in os.listdir(notes_dir) if f.endswith('.md')])
    if not note_files:
        print("No markdown note files found in notes directory.")
        return {'processed': 0, 'syndicated': 0}
        
    total_syndicated = 0
    
    for filename in note_files:
        file_path = os.path.join(notes_dir, filename)
        front_matter, body = parse_markdown_file(file_path)
        
        # Check if note has explicitly opted out
        if front_matter.get('syndicate') is False:
            continue
            
        syndication = front_matter.get('syndication', {})
        if not isinstance(syndication, dict):
            syndication = {}
            
        need_mastodon = (mastodon_ready or dry_run) and not syndication.get('mastodon')
        need_bluesky = (bluesky_ready or dry_run) and not syndication.get('bluesky')
        
        if not need_mastodon and not need_bluesky:
            continue
            
        slug = filename.replace('.md', '')
        canonical_url = f"{config['SITE_URL'].rstrip('/')}/notes/{slug}.html"
        plain_body = markdown_to_plain_text(body)
        
        print(f"\nProcessing Note: {filename}")
        print(f"Canonical URL: {canonical_url}")
        
        updated = False
        
        # Mastodon
        if need_mastodon:
            m_text = prepare_post_text(plain_body, canonical_url, max_chars=500)
            if dry_run:
                print(f"\n[DRY RUN] Would post to Mastodon ({len(m_text)} chars):")
                print(f"----------------------------------------\n{m_text}\n----------------------------------------")
                syndication['mastodon'] = f"https://{config.get('MASTODON_INSTANCE', 'mastodon.world')}/@preview/mock-id"
                updated = True
            else:
                try:
                    print("Posting to Mastodon...")
                    m_url = post_to_mastodon(config['MASTODON_INSTANCE'], config['MASTODON_ACCESS_TOKEN'], m_text)
                    syndication['mastodon'] = m_url
                    print(f"✓ Posted to Mastodon: {m_url}")
                    updated = True
                except Exception as e:
                    print(f"✗ Failed to post to Mastodon: {e}")
                    
        # Bluesky
        if need_bluesky:
            b_text = prepare_post_text(plain_body, canonical_url, max_chars=300)
            if dry_run:
                print(f"\n[DRY RUN] Would post to Bluesky ({len(b_text)} chars):")
                print(f"----------------------------------------\n{b_text}\n----------------------------------------")
                syndication['bluesky'] = f"https://bsky.app/profile/{config.get('BLUESKY_HANDLE', 'user.bsky.social')}/post/mock-rkey"
                updated = True
            else:
                try:
                    print("Posting to Bluesky...")
                    b_url = post_to_bluesky(config['BLUESKY_HANDLE'], config['BLUESKY_APP_PASSWORD'], b_text, canonical_url)
                    syndication['bluesky'] = b_url
                    print(f"✓ Posted to Bluesky: {b_url}")
                    updated = True
                except Exception as e:
                    print(f"✗ Failed to post to Bluesky: {e}")
                    
        if updated:
            total_syndicated += 1
            if not dry_run:
                front_matter['syndication'] = syndication
                save_markdown_file(file_path, front_matter, body)
                print(f"Saved syndication URLs to {filename}")

    print(f"\nSyndication complete: {total_syndicated} note(s) processed.")
    return {'processed': len(note_files), 'syndicated': total_syndicated}

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="POSSE syndication to Mastodon and Bluesky.")
    parser.add_argument('--dry-run', action='store_true', help="Preview social posts without actually publishing")
    parser.add_argument('--notes-dir', type=str, default=None, help="Path to src/notes directory")
    args = parser.parse_args()
    
    syndicate_notes(notes_dir=args.notes_dir, dry_run=args.dry_run)
