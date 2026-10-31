#!/usr/bin/env python3
"""Send webmentions for outbound links listed in webmention-manifest.json.

Run AFTER the site is deployed.
  python send_webmentions.py              # send anything new
  python send_webmentions.py --dry-run    # show what would be sent
  python send_webmentions.py --force      # resend even if already sent (e.g. after editing a post)
"""
import html
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from html.parser import HTMLParser

MANIFEST = 'webmention-manifest.json'
STATE = 'webmentions-sent.json'
UA = 'jonwhite.me webmention sender (+https://jonwhite.me)'
TIMEOUT = 15


def load_json(path):
    try:
        with open(path, encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


def fetch(url):
    return urllib.request.urlopen(
        urllib.request.Request(url, headers={'User-Agent': UA}), timeout=TIMEOUT
    )


class _EndpointFinder(HTMLParser):
    def __init__(self):
        super().__init__()
        self.endpoint = None

    def handle_starttag(self, tag, attrs):
        if self.endpoint is not None or tag not in ('link', 'a'):
            return
        a = dict(attrs)
        rels = (a.get('rel') or '').lower().split()
        if 'webmention' in rels and a.get('href') is not None:
            self.endpoint = a['href']


def discover_endpoint(target):
    """HTTP Link header first, then <link>/<a rel="webmention"> in the HTML."""
    with fetch(target) as resp:
        final_url = resp.geturl()
        for header in resp.headers.get_all('Link') or []:
            for m in re.finditer(r'<([^>]*)>([^<]*)', header):
                if re.search(r'rel="?[^",;]*\bwebmention\b', m.group(2), re.I):
                    return urllib.parse.urljoin(final_url, m.group(1))
        if 'html' not in resp.headers.get('Content-Type', '').lower():
            return None
        charset = resp.headers.get_content_charset() or 'utf-8'
        body = resp.read(2_000_000).decode(charset, errors='replace')
    finder = _EndpointFinder()
    finder.feed(body)
    if finder.endpoint is None:
        return None
    return urllib.parse.urljoin(final_url, finder.endpoint)


def send(source, target):
    endpoint = discover_endpoint(target)
    if not endpoint:
        return None, 'no webmention endpoint'
    data = urllib.parse.urlencode({'source': source, 'target': target}).encode()
    req = urllib.request.Request(
        endpoint, data=data,
        headers={'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded'},
    )
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            return r.status, endpoint
    except urllib.error.HTTPError as e:
        return e.code, endpoint


def main():
    force = '--force' in sys.argv
    dry = '--dry-run' in sys.argv
    manifest = load_json(MANIFEST)
    sent = load_json(STATE)

    for source, targets in manifest.items():
        try:
            with fetch(source) as r:
                live_html = r.read(5_000_000).decode('utf-8', errors='replace')
        except Exception as e:
            print(f'SKIP {source}: not live yet ({e})')
            continue

        already = set(sent.get(source, []))
        for target in targets:
            if not force and target in already:
                continue
            if target not in live_html and html.escape(target, quote=False) not in live_html:
                print(f'SKIP {target}: link not on the live page yet (deploy first?)')
                continue
            if dry:
                print(f'WOULD SEND {source} -> {target}')
                continue
            try:
                status, info = send(source, target)
            except Exception as e:
                print(f'FAIL {target}: {e}')
                continue
            if status is None:
                print(f'NONE {target}: {info}')
                already.add(target)           # don't re-scan every run; --force retries
            elif 200 <= status < 300:
                print(f'SENT {status} {target} via {info}')
                already.add(target)
            else:
                print(f'FAIL {status} {target} via {info}')
            time.sleep(1)                      # be polite to other people's servers

        if not dry:
            sent[source] = sorted(already)

    if not dry:
        with open(STATE, 'w', encoding='utf-8') as f:
            json.dump(sent, f, indent=2)


if __name__ == '__main__':
    main()