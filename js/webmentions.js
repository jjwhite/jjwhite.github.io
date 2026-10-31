// js/webmentions.js
// Fetches webmentions for the current page from webmention.io and renders them.
(() => {
  const section = document.getElementById('webmentions');
  if (!section) return;

  const summaryEl = document.getElementById('wm-summary');
  const listEl = document.getElementById('wm-list');

  // Only allow http(s) URLs, so a hostile mention can't inject javascript: links
  const safeUrl = (u) => {
    try {
      const parsed = new URL(u);
      return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : null;
    } catch {
      return null;
    }
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return isNaN(d) ? '' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  async function load() {
    // Use the canonical URL if the page declares one, otherwise the current URL
    const canonical = document.querySelector('link[rel="canonical"]');
    const url = canonical ? canonical.href : location.origin + location.pathname;

    // Ask for both variants of the URL (with and without a trailing slash)
    const targets = new Set([url, url.endsWith('/') ? url.slice(0, -1) : url + '/']);
    const qs = [...targets].map((t) => 'target[]=' + encodeURIComponent(t)).join('&');

    let mentions = [];
    try {
      const res = await fetch(`https://webmention.io/api/mentions.jf2?${qs}&per-page=200`);
      if (!res.ok) return;
      mentions = (await res.json()).children || [];
    } catch {
      return; // fail silently; the section just stays hidden
    }
    if (!mentions.length) return;

    const countOf = (prop) => mentions.filter((m) => m['wm-property'] === prop).length;
    const likes = countOf('like-of');
    const reposts = countOf('repost-of');
    const replies = mentions.filter((m) =>
      ['in-reply-to', 'mention-of'].includes(m['wm-property'])
    );

    summaryEl.textContent =
      `${likes} ${likes === 1 ? 'like' : 'likes'} · ` +
      `${reposts} ${reposts === 1 ? 'repost' : 'reposts'} · ` +
      `${replies.length} ${replies.length === 1 ? 'reply/mention' : 'replies/mentions'}`;

    replies
      .sort((a, b) => new Date(a.published || a['wm-received']) - new Date(b.published || b['wm-received']))
      .forEach((m) => {
        const li = document.createElement('li');
        li.className = 'wm-item';

        const header = document.createElement('div');
        header.className = 'wm-header';

        const authorName = (m.author && m.author.name) || 'Someone';
        const authorHref = safeUrl(m.author && m.author.url);
        let authorEl;
        if (authorHref) {
          authorEl = document.createElement('a');
          authorEl.href = authorHref;
          authorEl.rel = 'nofollow ugc noopener';
        } else {
          authorEl = document.createElement('span');
        }
        authorEl.className = 'wm-author';
        authorEl.textContent = authorName;
        header.append(authorEl);

        const sourceHref = safeUrl(m.url);
        const dateText = formatDate(m.published || m['wm-received']);
        if (sourceHref && dateText) {
          const link = document.createElement('a');
          link.href = sourceHref;
          link.rel = 'nofollow ugc noopener';
          link.className = 'wm-date';
          link.textContent = ' · ' + dateText;
          header.append(link);
        }

        const body = document.createElement('p');
        body.className = 'wm-content';
        // textContent only: never innerHTML for content from other people
        body.textContent = (m.content && m.content.text) || (m.name || '');

        li.append(header, body);
        listEl.append(li);
      });

    section.hidden = false;
  }

  load();
})();