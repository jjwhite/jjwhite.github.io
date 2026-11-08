function init(){
    loadTheme();
    initTagFiltering();
}

function loadTheme(){
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.querySelector('.theme-icon');
            
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeIcon.textContent = '☀️';
    } else {
        themeIcon.textContent = '🌙';
    }

}

function toggleTheme() {
    const body = document.body;
    
    const themeIcon = document.querySelector('.theme-icon');
    const currentTheme = body.getAttribute('data-theme');
    
    if (currentTheme === 'dark') {
        body.removeAttribute('data-theme');
        themeIcon.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        themeIcon.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    }

}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderTagsHtml(tags, basePath) {
    if (!tags || !tags.length) return '';
    const links = tags.map(t => {
        const clean = String(t).trim().replace(/^#/, '');
        return `    <a href="${basePath}?tag=${encodeURIComponent(clean)}" class="post-tag p-category">#${escapeHtml(clean)}</a>`;
    }).join('\n');
    return `  <div class="post-tags">\n${links}\n  </div>\n`;
}

function initTagFiltering() {
    const postsDataEl = document.getElementById('posts-data');
    const notesDataEl = document.getElementById('notes-data');

    if (!postsDataEl && !notesDataEl) {
        return;
    }

    if (postsDataEl) {
        setupListingFilter({
            dataEl: postsDataEl,
            containerSelector: '.blog-posts',
            paginationSelector: '.pagination',
            itemType: 'articles',
            basePath: '/posts/',
            renderItem: (post) => {
                const tagsHtml = renderTagsHtml(post.tags, '/posts/');
                const excerptHtml = post.excerpt ? `    <p class="post-excerpt">${escapeHtml(post.excerpt)}</p>\n` : '';
                return `  <article class="blog-post-preview" data-tags="${(post.tags || []).map(escapeHtml).join(',')}">
    <h2><a href="${escapeHtml(post.link)}">${escapeHtml(post.title)}</a></h2>
    <p class="post-date">${escapeHtml(post.date_display)}</p>
${excerptHtml}    <p><a href="${escapeHtml(post.link)}" class="read-more">Read more...</a></p>
${tagsHtml}  </article>`;
            }
        });
    }

    if (notesDataEl) {
        setupListingFilter({
            dataEl: notesDataEl,
            containerSelector: '.notes-feed',
            paginationSelector: '.pagination',
            itemType: 'notes',
            basePath: '/notes/',
            renderItem: (note) => {
                const tagsHtml = renderTagsHtml(note.tags, '/notes/');
                const syndicationHtml = note.syndication_html ? `    ${note.syndication_html}\n` : '';
                return `  <article class="h-entry note-card" id="${escapeHtml(note.slug)}" data-tags="${(note.tags || []).map(escapeHtml).join(',')}">
    <header class="note-header">
      <time class="dt-published note-date">${escapeHtml(note.date_display)}</time>
      <a href="${escapeHtml(note.link)}" class="u-url note-permalink" title="Permalink to note">#</a>
    </header>
    <div class="e-content note-content">
${note.html_content}
    </div>
${tagsHtml}${syndicationHtml}  </article>`;
            }
        });
    }
}

function setupListingFilter(config) {
    let items = [];
    try {
        items = JSON.parse(config.dataEl.textContent || '[]');
    } catch (e) {
        console.error('Failed to parse listing data:', e);
        return;
    }

    const container = document.querySelector(config.containerSelector);
    if (!container) return;

    const pagination = document.querySelector(config.paginationSelector);
    const initialHtml = container.innerHTML;
    const initialTitle = document.title;

    function getTagFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const tag = params.get('tag');
        if (!tag) return null;
        return tag.trim().replace(/^#/, '').toLowerCase();
    }

    function applyFilter(tag, updateHistory = false) {
        if (updateHistory) {
            const newUrl = tag ? `${config.basePath}?tag=${encodeURIComponent(tag)}` : config.basePath;
            window.history.pushState({ tag: tag }, '', newUrl);
        }

        const existingBanner = document.querySelector('.tag-filter-banner');
        if (existingBanner) existingBanner.remove();

        if (!tag) {
            container.innerHTML = initialHtml;
            if (pagination) pagination.style.display = '';
            document.title = initialTitle;
            attachTagClickHandlers();
            return;
        }

        const normalizedTag = tag.toLowerCase();
        const matches = items.filter(item => {
            if (!item.tags || !Array.isArray(item.tags)) return false;
            return item.tags.some(t => String(t).trim().replace(/^#/, '').toLowerCase() === normalizedTag);
        });

        if (pagination) pagination.style.display = 'none';

        const banner = document.createElement('div');
        banner.className = 'tag-filter-banner';
        const countText = `${matches.length} ${matches.length === 1 ? (config.itemType === 'articles' ? 'article' : 'note') : config.itemType}`;
        banner.innerHTML = `<span>Filtered by tag: <strong>#${escapeHtml(tag)}</strong> (${countText})</span>
<a href="${config.basePath}" class="tag-filter-clear" title="Clear filter">&times; Clear filter</a>`;

        container.parentNode.insertBefore(banner, container);

        banner.querySelector('.tag-filter-clear').addEventListener('click', function(e) {
            e.preventDefault();
            applyFilter(null, true);
        });

        if (matches.length > 0) {
            container.innerHTML = matches.map(config.renderItem).join('\n');
        } else {
            container.innerHTML = `<div class="no-tag-results">
    <p>No ${config.itemType} found tagged <strong>#${escapeHtml(tag)}</strong>.</p>
    <p><a href="${config.basePath}" class="clear-filter-link">Show all ${config.itemType}</a></p>
</div>`;
            const clearLink = container.querySelector('.clear-filter-link');
            if (clearLink) {
                clearLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    applyFilter(null, true);
                });
            }
        }

        document.title = `${config.itemType === 'articles' ? 'Blog' : 'Notes'} - #${tag} - Jon White's Blog`;
        attachTagClickHandlers();
    }

    function attachTagClickHandlers() {
        container.querySelectorAll('.post-tag').forEach(tagEl => {
            tagEl.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (!href) return;
                const match = href.match(/[?&]tag=([^&]+)/);
                if (match) {
                    e.preventDefault();
                    const clickedTag = decodeURIComponent(match[1]);
                    applyFilter(clickedTag, true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });
    }

    window.addEventListener('popstate', function() {
        applyFilter(getTagFromUrl(), false);
    });

    const initialTag = getTagFromUrl();
    if (initialTag) {
        applyFilter(initialTag, false);
    } else {
        attachTagClickHandlers();
    }
}
