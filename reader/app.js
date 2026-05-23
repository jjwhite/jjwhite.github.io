// --- State Management ---
const STATE_KEY = 'aura_rss_state';

let state = {
  feeds: [],
  articles: [],
  activeFilter: 'all', // 'all', 'unread', 'starred', or feedId (uuid)
  activeTab: 'all',    // 'all', 'unread', 'starred'
  searchQuery: '',
  viewLayout: 'grid',  // 'grid' or 'list'
  theme: 'dark'
};

// Default Feeds list
const DEFAULT_FEEDS = [
  { id: 'feed_hn', url: 'https://news.ycombinator.com/rss', name: 'Hacker News' },
  { id: 'feed_sm', url: 'https://www.smashingmagazine.com/feed/', name: 'Smashing Magazine' },
  { id: 'feed_nasa', url: 'https://www.nasa.gov/news-release/feed/', name: 'NASA News' }
];

// Load state from local storage
function loadState() {
  const raw = localStorage.getItem(STATE_KEY);
  if (raw) {
    try {
      state = JSON.parse(raw);
      // Ensure arrays exist
      state.feeds = state.feeds || [];
      state.articles = state.articles || [];
      state.activeFilter = state.activeFilter || 'all';
      state.activeTab = state.activeTab || 'all';
      state.searchQuery = ''; // Reset search query on load
      state.viewLayout = state.viewLayout || 'grid';
      state.theme = state.theme || 'dark';
    } catch (e) {
      console.error('Error parsing stored state:', e);
      initializeDefaultState();
    }
  } else {
    initializeDefaultState();
  }
}

function initializeDefaultState() {
  state.feeds = [...DEFAULT_FEEDS];
  state.articles = [];
  state.activeFilter = 'all';
  state.activeTab = 'all';
  state.searchQuery = '';
  state.viewLayout = 'grid';
  state.theme = 'dark';
  saveState();
}

// Save state to local storage
function saveState() {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage:', e);
    // If full, trim and try again
    trimArticlesCache(true);
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch (err) {
      showToast('Storage quota full. Failed to cache some feeds.', 'error');
    }
  }
}

// Trim old articles to prevent localStorage overflow
function trimArticlesCache(forceAggressive = false) {
  // Sort descending
  state.articles.sort((a, b) => b.pubDate - a.pubDate);
  
  const starred = state.articles.filter(a => a.starred);
  const unstarred = state.articles.filter(a => !a.starred);
  
  const maxUnstarred = forceAggressive ? 200 : 500;
  state.articles = [...starred, ...unstarred.slice(0, maxUnstarred)];
}

// --- Utilities ---
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return 'art_' + Math.abs(hash).toString(36);
}

function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  const min = 60 * 1000;
  const hour = 60 * min;
  const day = 24 * hour;
  
  if (diff < min) return 'Just now';
  if (diff < hour) return `${Math.floor(diff / min)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  return `${Math.floor(diff / day)}d ago`;
}

// Get initials of a feed name for default icon
function getFeedInitials(name) {
  return name ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'RSS';
}

// Helper to assign a random-ish consistent pastel color to initials based on feed name
function getFeedColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 45%)`;
}

// --- DOM Selection ---
const sidebar = document.getElementById('sidebar');
const menuOpen = document.getElementById('menu-open');
const menuClose = document.getElementById('menu-close');
const btnTheme = document.getElementById('btn-theme');
const themeDropdown = document.getElementById('theme-dropdown');
const btnRefresh = document.getElementById('btn-refresh');
const btnAddFeedTrigger = document.getElementById('btn-add-feed-trigger');
const btnOpmlTrigger = document.getElementById('btn-opml-trigger');
const searchBar = document.getElementById('search-bar');
const layoutGrid = document.getElementById('layout-grid');
const layoutList = document.getElementById('layout-list');
const articlesContainer = document.getElementById('articles-container');
const activeViewTitle = document.getElementById('active-view-title');
const activeViewCount = document.getElementById('active-view-count');
const sidebarFeedsList = document.getElementById('sidebar-feeds-list');
const formAddFeed = document.getElementById('form-add-feed');

// Badges
const badgeAll = document.getElementById('badge-all');
const badgeUnread = document.getElementById('badge-unread');
const badgeStarred = document.getElementById('badge-starred');

// Tabs
const tabAll = document.getElementById('tab-all');
const tabUnread = document.getElementById('tab-unread');
const tabStarred = document.getElementById('tab-starred');

// Reader Drawer elements
const readerOverlay = document.getElementById('reader-overlay');
const readerDrawer = document.getElementById('reader-drawer');
const btnReaderClose = document.getElementById('btn-reader-close');
const btnReaderToggleRead = document.getElementById('btn-reader-toggle-read');
const btnReaderToggleStar = document.getElementById('btn-reader-toggle-star');
const btnReaderExternal = document.getElementById('btn-reader-external');
const readerBodyContent = document.getElementById('reader-body-content');
const btnReaderPrev = document.getElementById('btn-reader-prev');
const btnReaderNext = document.getElementById('btn-reader-next');

let currentlyOpenArticleId = null;

// --- CORS Proxy Feed Fetching & Parsing ---
async function fetchFeedXML(url) {
  const encodedUrl = encodeURIComponent(url);
  const proxies = [
    `https://api.allorigins.win/get?url=${encodedUrl}`,
    `https://corsproxy.io/?${url}`
  ];

  let parsedXML = null;

  for (const proxyUrl of proxies) {
    try {
      const res = await fetch(proxyUrl);
      if (!res.ok) continue;

      let responseText = '';
      if (proxyUrl.includes('allorigins.win')) {
        const json = await res.json();
        responseText = json.contents;
      } else {
        responseText = await res.text();
      }

      if (responseText) {
        const parser = new DOMParser();
        parsedXML = parser.parseFromString(responseText, 'text/xml');
        if (!parsedXML.querySelector('parsererror')) {
          return parsedXML; // Success
        }
      }
    } catch (e) {
      console.warn(`Proxy failed: ${proxyUrl}`, e);
    }
  }

  throw new Error('All CORS proxies failed to fetch or parse this feed URL.');
}

function parseXMLToArticles(xmlDoc, feedId) {
  const articles = [];
  
  // Try RSS 2.0 format
  let items = xmlDoc.querySelectorAll('item');
  let isAtom = items.length === 0;
  
  if (isAtom) {
    // Atom Format
    items = xmlDoc.querySelectorAll('entry');
  }

  items.forEach(item => {
    let title = item.querySelector('title')?.textContent || 'Untitled Article';
    
    let link = '';
    if (isAtom) {
      const linkElem = item.querySelector('link');
      if (linkElem) {
        link = linkElem.getAttribute('href') || linkElem.textContent;
      }
    } else {
      link = item.querySelector('link')?.textContent || '';
    }
    
    // Normalize links
    link = link.trim();

    let dateStr = '';
    if (isAtom) {
      dateStr = item.querySelector('updated')?.textContent || item.querySelector('published')?.textContent || '';
    } else {
      dateStr = item.querySelector('pubDate')?.textContent || item.querySelector('pubdate')?.textContent || item.querySelector('dc\\:date')?.textContent || '';
    }
    
    const pubDate = dateStr ? new Date(dateStr).getTime() : Date.now();

    // Descriptions & Contents
    let description = item.querySelector('description')?.textContent || item.querySelector('summary')?.textContent || '';
    let content = '';
    
    // Try to query content tags
    const contentTag = item.querySelector('encoded') || item.querySelector('content');
    if (contentTag) {
      content = contentTag.textContent;
    } else {
      content = description;
    }

    // Build cleaner snippets for search/cards
    let cleanSnippet = description
      .replace(/<[^>]*>/g, '') // remove HTML tags
      .replace(/\s+/g, ' ')    // collapse whitespace
      .trim();
    
    if (cleanSnippet.length > 180) {
      cleanSnippet = cleanSnippet.substring(0, 180) + '...';
    }

    const articleId = hashString(link || (title + pubDate));

    articles.push({
      id: articleId,
      feedId: feedId,
      title: title,
      link: link,
      pubDate: pubDate,
      description: cleanSnippet,
      content: content || description,
      read: false,
      starred: false
    });
  });

  return articles;
}

// Fetch single feed and merge articles
async function refreshFeed(feed) {
  try {
    const xmlDoc = await fetchFeedXML(feed.url);
    
    // Auto-rename feed if it has no name yet
    if (!feed.name || feed.name === 'New Feed' || feed.name === feed.url) {
      const parsedName = xmlDoc.querySelector('channel > title')?.textContent || xmlDoc.querySelector('feed > title')?.textContent;
      if (parsedName) {
        feed.name = parsedName.trim();
      }
    }

    const fetchedArticles = parseXMLToArticles(xmlDoc, feed.id);
    
    // Merge fetched with current articles, preserving read/starred status
    fetchedArticles.forEach(newArt => {
      const existingIdx = state.articles.findIndex(a => a.id === newArt.id || a.link === newArt.link);
      if (existingIdx !== -1) {
        // Keep read and starred state
        newArt.read = state.articles[existingIdx].read;
        newArt.starred = state.articles[existingIdx].starred;
        // Update content if refreshed
        state.articles[existingIdx] = newArt;
      } else {
        state.articles.push(newArt);
      }
    });

    saveState();
  } catch (error) {
    console.error(`Error refreshing feed ${feed.name}:`, error);
    showToast(`Error refreshing "${feed.name}": feed might be invalid.`, 'error');
  }
}

// Refresh all feeds
async function refreshAllFeeds() {
  if (state.feeds.length === 0) {
    renderArticles();
    updateBadges();
    return;
  }

  showToast('Refreshing all feeds...', 'info');
  btnRefresh.classList.add('loading-spin');
  btnRefresh.disabled = true;
  
  renderSkeletons();

  // Refresh all concurrently
  const refreshPromises = state.feeds.map(feed => refreshFeed(feed));
  await Promise.allSettled(refreshPromises);

  trimArticlesCache();
  saveState();
  
  btnRefresh.classList.remove('loading-spin');
  btnRefresh.disabled = false;
  
  renderSidebarFeeds();
  renderArticles();
  updateBadges();
  showToast('Feeds updated successfully!', 'success');
}

// --- Render Skeletons ---
function renderSkeletons() {
  articlesContainer.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton-card';
    skeleton.innerHTML = `
      <div class="skeleton-shimmer"></div>
      <div class="skeleton-meta">
        <div class="skeleton-line sm"></div>
        <div class="skeleton-line sm"></div>
      </div>
      <div class="skeleton-line xl"></div>
      <div class="skeleton-line lg"></div>
      <div class="skeleton-desc">
        <div class="skeleton-line xl"></div>
        <div class="skeleton-line md"></div>
      </div>
    `;
    articlesContainer.appendChild(skeleton);
  }
}

// --- UI Rendering ---

// Render Feed items in sidebar
function renderSidebarFeeds() {
  sidebarFeedsList.innerHTML = '';
  
  if (state.feeds.length === 0) {
    sidebarFeedsList.innerHTML = `<div style="padding: 12px; font-size: 0.8rem; color: var(--text-muted); text-align: center;">No subscriptions yet</div>`;
    return;
  }

  state.feeds.forEach(feed => {
    const item = document.createElement('div');
    item.className = `nav-item feed-item ${state.activeFilter === feed.id ? 'active' : ''}`;
    item.setAttribute('data-id', feed.id);
    
    const unreadCount = state.articles.filter(a => a.feedId === feed.id && !a.read).length;
    const initials = getFeedInitials(feed.name);
    const color = getFeedColor(feed.name);

    item.innerHTML = `
      <div class="nav-item-left">
        <span class="source-icon" style="background-color: ${color};">${initials}</span>
        <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 140px;" title="${feed.name}">${feed.name}</span>
      </div>
      <span class="badge badge-feed-count">${unreadCount}</span>
      <button class="feed-delete-btn" title="Unsubscribe" aria-label="Unsubscribe from ${feed.name}">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>
    `;

    // Handle selection
    item.addEventListener('click', (e) => {
      // Ignore click if deleted button is clicked
      if (e.target.closest('.feed-delete-btn')) {
        deleteFeed(feed.id);
        return;
      }
      setActiveFilter(feed.id);
      if (window.innerWidth <= 1024) sidebar.classList.remove('open');
    });

    sidebarFeedsList.appendChild(item);
  });
}

// Render active article cards
function renderArticles() {
  articlesContainer.innerHTML = '';
  
  // Sort descending by date
  let filtered = [...state.articles].sort((a, b) => b.pubDate - a.pubDate);
  
  // 1. Sidebar filter (feedId, all, unread, starred)
  if (state.activeFilter === 'unread') {
    filtered = filtered.filter(a => !a.read);
  } else if (state.activeFilter === 'starred') {
    filtered = filtered.filter(a => a.starred);
  } else if (state.activeFilter !== 'all') {
    // Feed ID
    filtered = filtered.filter(a => a.feedId === state.activeFilter);
  }

  // 2. Top bar tabs filter (all, unread, starred)
  if (state.activeTab === 'unread') {
    filtered = filtered.filter(a => !a.read);
  } else if (state.activeTab === 'starred') {
    filtered = filtered.filter(a => a.starred);
  }

  // 3. Search query filter
  if (state.searchQuery.trim() !== '') {
    const q = state.searchQuery.toLowerCase();
    filtered = filtered.filter(a => 
      a.title.toLowerCase().includes(q) || 
      a.description.toLowerCase().includes(q) ||
      a.content.toLowerCase().includes(q)
    );
  }

  // Layout View (grid/list)
  if (state.viewLayout === 'list') {
    articlesContainer.classList.add('list-view');
  } else {
    articlesContainer.classList.remove('list-view');
  }

  // Update layout header count
  activeViewCount.textContent = `${filtered.length} articles found`;

  if (filtered.length === 0) {
    renderEmptyState();
    return;
  }

  filtered.forEach(art => {
    const feed = state.feeds.find(f => f.id === art.feedId) || { name: 'RSS Feed' };
    const initials = getFeedInitials(feed.name);
    const color = getFeedColor(feed.name);
    const relativeTime = formatRelativeTime(art.pubDate);

    const card = document.createElement('article');
    card.className = `article-card ${art.read ? 'read' : ''}`;
    card.setAttribute('data-id', art.id);

    card.innerHTML = `
      <div class="card-meta">
        <div class="card-source">
          <span class="source-icon" style="background-color: ${color}">${initials}</span>
          <span style="font-weight: 700;">${feed.name}</span>
        </div>
        <span class="card-time">${relativeTime}</span>
      </div>
      <h2 class="article-title">${art.title}</h2>
      <p class="article-snippet">${art.description}</p>
      <div class="card-footer">
        <span class="read-indicator"></span>
        <div class="card-actions">
          <button class="btn-card-action btn-toggle-read" title="${art.read ? 'Mark Unread' : 'Mark Read'}">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"></circle>
              ${art.read ? '' : '<circle cx="12" cy="12" r="3" fill="currentColor"></circle>'}
            </svg>
          </button>
          <button class="btn-card-action btn-toggle-star ${art.starred ? 'starred' : ''}" title="${art.starred ? 'Remove Bookmark' : 'Bookmark Article'}">
            <svg width="16" height="16" fill="${art.starred ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    `;

    // Click handler for opening reading pane
    card.addEventListener('click', (e) => {
      // If client clicks a card action button, don't open details modal
      if (e.target.closest('.btn-card-action')) {
        const toggleReadBtn = e.target.closest('.btn-toggle-read');
        const toggleStarBtn = e.target.closest('.btn-toggle-star');
        
        if (toggleReadBtn) toggleRead(art.id);
        if (toggleStarBtn) toggleStar(art.id);
        return;
      }
      openReader(art.id);
    });

    articlesContainer.appendChild(card);
  });
}

function renderEmptyState() {
  let icon = `
    <svg width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>`;
  let title = "No Articles Found";
  let desc = "There are no articles in this section matching your filters.";
  let actionHtml = '';

  if (state.feeds.length === 0) {
    title = "Add RSS Subscriptions";
    desc = "Subscribe to your favorite feeds to aggregate articles here.";
    actionHtml = `<button class="btn-primary" onclick="openModal('modal-add-feed')">Add First Feed</button>`;
  }

  articlesContainer.innerHTML = `
    <div class="empty-state">
      ${icon}
      <h3 class="empty-state-title">${title}</h3>
      <p class="empty-state-desc">${desc}</p>
      ${actionHtml}
    </div>
  `;
}

// Update counters in sidebar
function updateBadges() {
  const allCount = state.articles.length;
  const unreadCount = state.articles.filter(a => !a.read).length;
  const starredCount = state.articles.filter(a => a.starred).length;

  badgeAll.textContent = allCount;
  badgeUnread.textContent = unreadCount;
  badgeStarred.textContent = starredCount;
}

// --- Action Handlers ---

function setActiveFilter(filter) {
  state.activeFilter = filter;
  
  // Highlight active sidebar item
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(el => el.classList.remove('active'));
  
  if (filter === 'all') {
    document.getElementById('lib-all').classList.add('active');
    activeViewTitle.textContent = "All Articles";
  } else if (filter === 'unread') {
    document.getElementById('lib-unread').classList.add('active');
    activeViewTitle.textContent = "Unread Articles";
  } else if (filter === 'starred') {
    document.getElementById('lib-starred').classList.add('active');
    activeViewTitle.textContent = "Starred Articles";
  } else {
    // Feed item
    const feed = state.feeds.find(f => f.id === filter);
    if (feed) {
      const activeItem = document.querySelector(`.sidebar-nav .nav-item[data-id="${filter}"]`);
      if (activeItem) activeItem.classList.add('active');
      activeViewTitle.textContent = feed.name;
    }
  }

  renderArticles();
  saveState();
}

function setActiveTab(tab) {
  state.activeTab = tab;
  
  document.querySelectorAll('.feed-tab').forEach(el => el.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  
  renderArticles();
  saveState();
}

// Add dynamic new feed URL
async function addNewFeed(url, customName = '') {
  // Normalize URL
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  // Prevent duplicates
  if (state.feeds.some(f => f.url.toLowerCase() === url.toLowerCase())) {
    showToast('You are already subscribed to this feed URL.', 'error');
    return;
  }

  const feedId = 'feed_' + Math.random().toString(36).substr(2, 9);
  const newFeed = {
    id: feedId,
    url: url,
    name: customName.trim() || url
  };

  showToast('Adding feed subscription...', 'info');
  openModalSkeletons();
  
  try {
    const xmlDoc = await fetchFeedXML(url);
    const parsedName = xmlDoc.querySelector('channel > title')?.textContent || xmlDoc.querySelector('feed > title')?.textContent || 'New RSS Feed';
    
    if (!newFeed.name || newFeed.name === url) {
      newFeed.name = parsedName.trim();
    }

    state.feeds.push(newFeed);
    
    // Parse articles
    const fetchedArticles = parseXMLToArticles(xmlDoc, feedId);
    state.articles.push(...fetchedArticles);

    trimArticlesCache();
    saveState();
    
    renderSidebarFeeds();
    setActiveFilter(feedId);
    updateBadges();
    
    closeModal('modal-add-feed');
    showToast(`Subscribed to "${newFeed.name}"!`, 'success');
  } catch (error) {
    console.error('Failed to add feed:', error);
    closeModalSkeletons();
    showToast('Failed to subscribe. Verify the RSS URL is correct.', 'error');
  }
}

function openModalSkeletons() {
  articlesContainer.innerHTML = '';
  renderSkeletons();
}

function closeModalSkeletons() {
  renderArticles();
}

// Delete feed subscription
function deleteFeed(feedId) {
  const feedIndex = state.feeds.findIndex(f => f.id === feedId);
  if (feedIndex === -1) return;
  
  const feedName = state.feeds[feedIndex].name;
  
  if (confirm(`Are you sure you want to unsubscribe from "${feedName}"?`)) {
    state.feeds.splice(feedIndex, 1);
    
    // Remove all cached articles for this feed
    state.articles = state.articles.filter(a => a.feedId !== feedId);
    
    saveState();
    
    if (state.activeFilter === feedId) {
      setActiveFilter('all');
    } else {
      renderSidebarFeeds();
      renderArticles();
      updateBadges();
    }
    
    showToast(`Unsubscribed from "${feedName}".`, 'success');
  }
}

// Mark Article read/unread toggle
function toggleRead(articleId) {
  const article = state.articles.find(a => a.id === articleId);
  if (article) {
    article.read = !article.read;
    saveState();
    renderArticles();
    renderSidebarFeeds();
    updateBadges();
    
    // Update reader controls if open
    if (currentlyOpenArticleId === articleId) {
      updateReaderControls(article);
    }
  }
}

// Mark Article star/bookmark toggle
function toggleStar(articleId) {
  const article = state.articles.find(a => a.id === articleId);
  if (article) {
    article.starred = !article.starred;
    saveState();
    renderArticles();
    updateBadges();
    
    // Update reader controls if open
    if (currentlyOpenArticleId === articleId) {
      updateReaderControls(article);
    }
  }
}

// --- Reader View Actions ---

function openReader(articleId) {
  const article = state.articles.find(a => a.id === articleId);
  if (!article) return;
  
  currentlyOpenArticleId = articleId;
  
  // Auto-mark as read when opened
  if (!article.read) {
    article.read = true;
    saveState();
    renderArticles();
    renderSidebarFeeds();
    updateBadges();
  }

  const feed = state.feeds.find(f => f.id === article.feedId) || { name: 'RSS Feed' };
  const formattedDate = new Date(article.pubDate).toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  // Populate reader panel
  readerBodyContent.innerHTML = `
    <div class="reader-article-meta">
      <span>${feed.name}</span>
      <span>•</span>
      <span>${formattedDate}</span>
    </div>
    <h1 class="reader-article-title">${article.title}</h1>
    <div class="reader-article-content">
      ${article.content || article.description}
    </div>
  `;

  // Update actions
  updateReaderControls(article);
  btnReaderExternal.href = article.link;

  // Show reading panel drawer
  readerOverlay.style.display = 'block';
  setTimeout(() => {
    readerOverlay.classList.add('show');
    readerDrawer.classList.add('show');
  }, 10);
}

function updateReaderControls(article) {
  // Read icon styling
  if (article.read) {
    btnReaderToggleRead.title = "Mark as Unread";
    btnReaderToggleRead.innerHTML = `
      <svg width="18" height="18" fill="currentColor" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"></circle>
      </svg>`;
    btnReaderToggleRead.style.color = 'var(--text-muted)';
  } else {
    btnReaderToggleRead.title = "Mark as Read";
    btnReaderToggleRead.innerHTML = `
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="3" fill="currentColor"></circle>
      </svg>`;
    btnReaderToggleRead.style.color = 'var(--accent-primary)';
  }

  // Star styling
  if (article.starred) {
    btnReaderToggleStar.title = "Unstar Article";
    btnReaderToggleStar.classList.add('starred');
    btnReaderToggleStar.innerHTML = `
      <svg width="18" height="18" fill="currentColor" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>`;
  } else {
    btnReaderToggleStar.title = "Star Article";
    btnReaderToggleStar.classList.remove('starred');
    btnReaderToggleStar.innerHTML = `
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>`;
  }
}

function closeReader() {
  currentlyOpenArticleId = null;
  readerOverlay.classList.remove('show');
  readerDrawer.classList.remove('show');
  setTimeout(() => {
    readerOverlay.style.display = 'none';
  }, 250);
}

// Navigate reader prev/next
function navigateReader(direction) {
  // Get active article sorting & filters to match current card positions
  let filtered = [...state.articles].sort((a, b) => b.pubDate - a.pubDate);
  if (state.activeFilter === 'unread') {
    filtered = filtered.filter(a => !a.read);
  } else if (state.activeFilter === 'starred') {
    filtered = filtered.filter(a => a.starred);
  } else if (state.activeFilter !== 'all') {
    filtered = filtered.filter(a => a.feedId === state.activeFilter);
  }

  if (state.activeTab === 'unread') {
    filtered = filtered.filter(a => !a.read);
  } else if (state.activeTab === 'starred') {
    filtered = filtered.filter(a => a.starred);
  }

  if (state.searchQuery.trim() !== '') {
    const q = state.searchQuery.toLowerCase();
    filtered = filtered.filter(a => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
  }

  const currentIdx = filtered.findIndex(a => a.id === currentlyOpenArticleId);
  if (currentIdx === -1) return;

  let targetIdx = currentIdx + (direction === 'next' ? 1 : -1);
  
  if (targetIdx >= 0 && targetIdx < filtered.length) {
    openReader(filtered[targetIdx].id);
  } else {
    showToast('No more articles in this view.', 'info');
  }
}

// --- OPML Handling ---

function exportToOPML() {
  if (state.feeds.length === 0) {
    showToast('You have no subscribed feeds to export.', 'error');
    return;
  }

  let opmlText = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>Aura RSS Export</title>
    <dateCreated>${new Date().toUTCString()}</dateCreated>
  </head>
  <body>
    <outline text="Subscriptions" title="Subscriptions">
  `;

  state.feeds.forEach(feed => {
    const text = escapeXml(feed.name);
    const xmlUrl = escapeXml(feed.url);
    opmlText += `      <outline type="rss" text="${text}" title="${text}" xmlUrl="${xmlUrl}" htmlUrl="" />\n`;
  });

  opmlText += `    </outline>
  </body>
</opml>`;

  const blob = new Blob([opmlText], { type: 'text/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aura-rss-feeds-${new Date().toISOString().slice(0, 10)}.opml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('OPML file exported successfully!', 'success');
}

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

function parseAndImportOPML(xmlText) {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    if (xmlDoc.querySelector('parsererror')) {
      throw new Error('Invalid XML file structure');
    }

    const outlines = xmlDoc.querySelectorAll('outline[xmlUrl]');
    if (outlines.length === 0) {
      showToast('No valid RSS feeds found in OPML file.', 'error');
      return;
    }

    let addedCount = 0;
    outlines.forEach(outline => {
      const url = outline.getAttribute('xmlUrl');
      const name = outline.getAttribute('title') || outline.getAttribute('text') || 'Imported Feed';
      
      if (url && !state.feeds.some(f => f.url.toLowerCase() === url.toLowerCase())) {
        const feedId = 'feed_' + Math.random().toString(36).substr(2, 9);
        state.feeds.push({
          id: feedId,
          url: url,
          name: name
        });
        addedCount++;
      }
    });

    if (addedCount > 0) {
      saveState();
      renderSidebarFeeds();
      setActiveFilter('all');
      updateBadges();
      closeModal('modal-opml');
      showToast(`Imported ${addedCount} feeds! Syncing...`, 'success');
      refreshAllFeeds();
    } else {
      showToast('All feeds in OPML were already subscribed.', 'info');
    }
  } catch (error) {
    console.error('OPML Import failed:', error);
    showToast('Failed to parse OPML. Ensure it is a valid format.', 'error');
  }
}

// --- Toast & Modals Helpers ---

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');
  const toastIconSvg = document.getElementById('toast-icon-svg');

  // Set class for styling
  toast.className = `toast-container toast-${type}`;
  toastMsg.textContent = message;
  
  // Set appropriate icons
  if (type === 'success') {
    toastIconSvg.innerHTML = `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>`;
  } else if (type === 'error') {
    toastIconSvg.innerHTML = `<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>`;
  } else {
    // Info / generic
    toastIconSvg.innerHTML = `<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>`;
  }

  // Display toast animation
  toast.classList.add('show');
  
  // Clear previous timeouts if triggering multiple
  if (window.toastTimeout) clearTimeout(window.toastTimeout);
  
  window.toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = 'flex';
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove('show');
  setTimeout(() => {
    modal.style.display = 'none';
  }, 250);
}

// --- Theme Management ---

function toggleThemeMenu() {
  themeDropdown.classList.toggle('show');
}

function applyTheme(themeName) {
  document.documentElement.setAttribute('data-theme', themeName);
  state.theme = themeName;
  saveState();
  
  // Highlight active button in dropdown
  document.querySelectorAll('.theme-opt').forEach(btn => {
    if (btn.getAttribute('data-value') === themeName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update theme toggle icon based on selection
  if (themeName === 'light') {
    btnTheme.innerHTML = `
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>`;
  } else if (themeName === 'sepia') {
    btnTheme.innerHTML = `
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
      </svg>`;
  } else {
    // dark
    btnTheme.innerHTML = `
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>`;
  }
}

// --- Initialize Event Listeners ---

function initEventListeners() {
  // Mobile Sidebar Toggles
  menuOpen.addEventListener('click', () => sidebar.classList.add('open'));
  menuClose.addEventListener('click', () => sidebar.classList.remove('open'));
  
  // Add trigger event listener for subscription modal
  btnAddFeedTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    openModal('modal-add-feed');
  });

  // OPML Trigger
  btnOpmlTrigger.addEventListener('click', () => openModal('modal-opml'));

  // Feed Form Submit
  formAddFeed.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = document.getElementById('feed-url').value;
    const name = document.getElementById('feed-name').value;
    addNewFeed(url, name);
  });

  // Export/Import OPML Buttons
  document.getElementById('btn-export-opml').addEventListener('click', exportToOPML);
  
  const fileInput = document.getElementById('file-opml-input');
  document.getElementById('btn-select-opml').addEventListener('click', () => fileInput.click());
  
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => parseAndImportOPML(event.target.result);
    reader.readAsText(file);
  });

  // OPML Drag & Drop Zone
  const dropZone = document.getElementById('opml-drop-zone');
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => parseAndImportOPML(event.target.result);
      reader.readAsText(file);
    }
  });

  // Search Live Filter
  searchBar.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderArticles();
  });

  // Global Refresh Action
  btnRefresh.addEventListener('click', refreshAllFeeds);

  // Library Navigation Clicks
  document.getElementById('lib-all').addEventListener('click', () => setActiveFilter('all'));
  document.getElementById('lib-unread').addEventListener('click', () => setActiveFilter('unread'));
  document.getElementById('lib-starred').addEventListener('click', () => setActiveFilter('starred'));

  // Article Feed Toolbar Tabs
  tabAll.addEventListener('click', () => setActiveTab('all'));
  tabUnread.addEventListener('click', () => setActiveTab('unread'));
  tabStarred.addEventListener('click', () => setActiveTab('starred'));

  // Layout View Switcher
  layoutGrid.addEventListener('click', () => {
    layoutGrid.classList.add('active');
    layoutList.classList.remove('active');
    state.viewLayout = 'grid';
    saveState();
    renderArticles();
  });
  
  layoutList.addEventListener('click', () => {
    layoutList.classList.add('active');
    layoutGrid.classList.remove('active');
    state.viewLayout = 'list';
    saveState();
    renderArticles();
  });

  // Theme Toggler Dropdown
  btnTheme.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleThemeMenu();
  });

  document.querySelectorAll('.theme-opt').forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const themeValue = opt.getAttribute('data-value');
      applyTheme(themeValue);
      themeDropdown.classList.remove('show');
    });
  });

  // Close dropdown on outside click
  document.addEventListener('click', () => {
    themeDropdown.classList.remove('show');
  });

  // Close Reader Elements
  btnReaderClose.addEventListener('click', closeReader);
  readerOverlay.addEventListener('click', closeReader);

  // Reader Quick Actions
  btnReaderToggleRead.addEventListener('click', () => {
    if (currentlyOpenArticleId) toggleRead(currentlyOpenArticleId);
  });
  btnReaderToggleStar.addEventListener('click', () => {
    if (currentlyOpenArticleId) toggleStar(currentlyOpenArticleId);
  });
  btnReaderPrev.addEventListener('click', () => navigateReader('prev'));
  btnReaderNext.addEventListener('click', () => navigateReader('next'));

  // Keyboard navigation support for Reader
  document.addEventListener('keydown', (e) => {
    if (!currentlyOpenArticleId) return;
    
    if (e.key === 'Escape') {
      closeReader();
    } else if (e.key === 'ArrowLeft') {
      navigateReader('prev');
    } else if (e.key === 'ArrowRight') {
      navigateReader('next');
    }
  });
}

// --- Main Init ---

window.addEventListener('DOMContentLoaded', () => {
  loadState();
  applyTheme(state.theme);
  
  // Set layout button state active indicator
  if (state.viewLayout === 'list') {
    layoutList.classList.add('active');
    layoutGrid.classList.remove('active');
  } else {
    layoutGrid.classList.add('active');
    layoutList.classList.remove('active');
  }

  initEventListeners();
  renderSidebarFeeds();
  renderArticles();
  updateBadges();

  // Auto refresh feeds on load
  refreshAllFeeds();
});
