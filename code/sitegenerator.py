import os
import markdown
import yaml
import re
import math
import html
import argparse
from email.utils import formatdate
import time
from datetime import datetime, date
import xml.etree.ElementTree as ET
from xml.dom import minidom

def load_template(template_path):
    with open(template_path, 'r', encoding='utf-8') as file:
        return file.read()

def parse_date(date_val):
    """Parse various date formats into a datetime object for reliable sorting."""
    if isinstance(date_val, datetime):
        return date_val
    if isinstance(date_val, date):
        return datetime.combine(date_val, datetime.min.time())
    if isinstance(date_val, str):
        for fmt in ('%Y-%m-%d %H:%M:%S', '%Y-%m-%d %H:%M', '%Y-%m-%d'):
            try:
                return datetime.strptime(date_val.strip(), fmt)
            except ValueError:
                pass
    return datetime.now()

def format_display_date(date_val, include_time_if_present=True):
    """Format date for human-readable display."""
    dt = parse_date(date_val)
    if include_time_if_present and isinstance(date_val, (datetime, str)) and (':' in str(date_val)):
        formatted = dt.strftime('%B %d, %Y at %I:%M %p')
        # Remove leading zero on hour if present: ' 09:' -> ' 9:'
        return re.sub(r'at 0(\d):', r'at \1:', formatted)
    else:
        return dt.strftime('%B %d, %Y')

def format_syndication_html(syndication):
    """Generate HTML links for syndicated platforms."""
    if not syndication or not isinstance(syndication, dict):
        return ""
    links = []
    if syndication.get('mastodon'):
        links.append(f'<a href="{html.escape(str(syndication["mastodon"]))}" target="_blank" rel="syndication me">Mastodon</a>')
    if syndication.get('bluesky'):
        links.append(f'<a href="{html.escape(str(syndication["bluesky"]))}" target="_blank" rel="syndication me">Bluesky</a>')
    if not links:
        return ""
    return f'<div class="note-syndication"><span>Syndicated to:</span> ' + ' <span class="divider">|</span> '.join(links) + '</div>'

def convert_markdown_to_html(markdown_file_path, template):
    with open(markdown_file_path, 'r', encoding='utf-8') as markdown_file:
        markdown_content = markdown_file.read()
    
    # Extract YAML front matter
    yaml_match = re.match(r'---\s*\n(.*?)\n---\s*\n(.*)', markdown_content, re.DOTALL)
    if yaml_match:
        yaml_content = yaml_match.group(1)
        markdown_content = yaml_match.group(2)  # Markdown content without YAML
        front_matter = yaml.safe_load(yaml_content) or {}
    else:
        front_matter = {}
    
    # Convert Markdown to HTML
    html_content = markdown.markdown(markdown_content)
    
    # Replace placeholders in the template
    final_content = template.replace('{{page_content}}', html_content)
   
    title = front_matter.get('title', 'Untitled')
    date_val = front_matter.get('date', 'Unknown Date')
    date_str = format_display_date(date_val, include_time_if_present=False) if date_val != 'Unknown Date' else 'Unknown Date'
    
    final_content = final_content.replace('{{title}}', title)
    final_content = final_content.replace('{{date}}', date_str)
    final_content = final_content.replace('{{year}}', str(datetime.now().year))
    
    return final_content, front_matter

def generate_pagination_links(current_page, total_pages, page_depth=1):
    """Generate HTML for pagination links"""
    if total_pages <= 1:
        return ''
    
    # Adjust paths based on directory depth
    if page_depth == 1:
        # Main page (/posts/index.html or /notes/index.html)
        path_prefix = ""
    else:
        # Subpages (/posts/page/X/index.html or /notes/page/X/index.html) - need to go up two levels
        path_prefix = "../../"
    
    pagination_html = '<div class="pagination">\n'
    
    # Previous button
    if current_page > 1:
        prev_url = f'{path_prefix}index.html' if current_page == 2 else f'{path_prefix}page/{current_page - 1}/index.html'
        pagination_html += f'  <a href="{prev_url}" class="pagination-btn">&laquo; Previous</a>\n'
    
    # Page numbers
    pagination_html += '  <span class="pagination-numbers">\n'
    for page in range(1, total_pages + 1):
        if page == current_page:
            pagination_html += f'    <span class="current-page">{page}</span>\n'
        else:
            page_url = f'{path_prefix}index.html' if page == 1 else f'{path_prefix}page/{page}/index.html'
            pagination_html += f'    <a href="{page_url}" class="page-number">{page}</a>\n'
    pagination_html += '  </span>\n'
    
    # Next button
    if current_page < total_pages:
        next_url = f'{path_prefix}page/{current_page + 1}/index.html'
        pagination_html += f'  <a href="{next_url}" class="pagination-btn">Next &raquo;</a>\n'
    
    pagination_html += '</div>\n'
    
    return pagination_html

def generate_blog_pages(posts_data, blog_template, output_posts_dir, posts_per_page=10):
    """Generate paginated blog pages in posts directory"""
    if not posts_data:
        return
    
    # Sort posts by date (newest first)
    sorted_posts = sorted(posts_data, key=lambda x: parse_date(x[2]), reverse=True)
    total_posts = len(sorted_posts)
    total_pages = math.ceil(total_posts / posts_per_page)
    
    for page in range(1, total_pages + 1):
        start_idx = (page - 1) * posts_per_page
        end_idx = start_idx + posts_per_page
        page_posts = sorted_posts[start_idx:end_idx]
        
        # Generate posts list HTML for this page
        posts_list_html = '<div class="blog-posts">\n'
        for title, link, date_val, excerpt in page_posts:
            # Calculate correct relative link based on page depth
            if page == 1:
                relative_link = os.path.basename(link)
            else:
                relative_link = f"../../{os.path.basename(link)}"
            
            date_display = format_display_date(date_val, include_time_if_present=False)
            
            posts_list_html += f'  <article class="blog-post-preview">\n'
            posts_list_html += f'    <h2><a href="{relative_link}">{title}</a></h2>\n'
            posts_list_html += f'    <p class="post-date">{date_display}</p>\n'
            if excerpt:
                posts_list_html += f'    <p class="post-excerpt">{excerpt}</p>\n'
            posts_list_html += f'    <p><a href="{relative_link}" class="read-more">Read more...</a></p>\n'
            posts_list_html += f'  </article>\n'
        posts_list_html += '</div>\n'
        
        # Generate pagination links with correct depth
        page_depth = 1 if page == 1 else 2
        pagination_html = generate_pagination_links(page, total_pages, page_depth)
        
        # Replace template placeholders
        page_content = blog_template.replace('{{post_list}}', posts_list_html)
        page_content = page_content.replace('{{pagination}}', pagination_html)
        page_content = page_content.replace('{{current_page}}', str(page))
        page_content = page_content.replace('{{total_pages}}', str(total_pages))
        page_content = page_content.replace('{{year}}', str(datetime.now().year))
        
        # Set page title
        if page == 1:
            page_title = 'Blog'
        else:
            page_title = f'Blog - Page {page}'
        page_content = page_content.replace('{{title}}', page_title)
        
        # Create directory structure and write files
        if page == 1:
            output_file = os.path.join(output_posts_dir, 'index.html')
        else:
            page_dir = os.path.join(output_posts_dir, 'page', str(page))
            os.makedirs(page_dir, exist_ok=True)
            output_file = os.path.join(page_dir, 'index.html')
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(page_content)
        
        print(f"Generated blog page: {os.path.relpath(output_file)}")

def generate_notes_pages(notes_data, notes_template, output_notes_dir, notes_per_page=15):
    """Generate paginated microblog feed pages in notes directory."""
    if not notes_data:
        return
        
    # Sort notes by date object descending (newest first)
    sorted_notes = sorted(notes_data, key=lambda x: x['date_obj'], reverse=True)
    total_notes = len(sorted_notes)
    total_pages = math.ceil(total_notes / notes_per_page)
    os.makedirs(output_notes_dir, exist_ok=True)
    
    for page in range(1, total_pages + 1):
        start_idx = (page - 1) * notes_per_page
        end_idx = start_idx + notes_per_page
        page_notes = sorted_notes[start_idx:end_idx]
        
        # Build notes timeline HTML
        notes_list_html = ''
        for note in page_notes:
            slug = note['slug']
            date_display = note['date_str']
            html_content = note['html_content']
            syndication_html = note['syndication_html']
            
            # Permalink relative link
            if page == 1:
                permalink = f"{slug}.html"
            else:
                permalink = f"../../{slug}.html"
                
            notes_list_html += f'  <article class="note-card" id="{slug}">\n'
            notes_list_html += f'    <header class="note-header">\n'
            notes_list_html += f'      <time class="note-date">{date_display}</time>\n'
            notes_list_html += f'      <a href="{permalink}" class="note-permalink" title="Permalink to note">#</a>\n'
            notes_list_html += f'    </header>\n'
            notes_list_html += f'    <div class="note-content">\n{html_content}\n    </div>\n'
            if syndication_html:
                notes_list_html += f'    {syndication_html}\n'
            notes_list_html += f'  </article>\n'
            
        page_depth = 1 if page == 1 else 2
        pagination_html = generate_pagination_links(page, total_pages, page_depth)
        
        page_content = notes_template.replace('{{notes_list}}', notes_list_html)
        page_content = page_content.replace('{{pagination}}', pagination_html)
        page_content = page_content.replace('{{current_page}}', str(page))
        page_content = page_content.replace('{{total_pages}}', str(total_pages))
        page_content = page_content.replace('{{year}}', str(datetime.now().year))
        
        if page == 1:
            page_title = 'Notes'
            output_file = os.path.join(output_notes_dir, 'index.html')
        else:
            page_title = f'Notes - Page {page}'
            page_dir = os.path.join(output_notes_dir, 'page', str(page))
            os.makedirs(page_dir, exist_ok=True)
            output_file = os.path.join(page_dir, 'index.html')
            
        page_content = page_content.replace('{{title}}', page_title)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(page_content)
            
        print(f"Generated notes page: {os.path.relpath(output_file)}")

def extract_excerpt(markdown_content, max_words=50):
    """Extract an excerpt from markdown content, stripping images and formatting"""
    # Remove YAML front matter
    yaml_match = re.match(r'---\s*\n(.*?)\n---\s*\n(.*)', markdown_content, re.DOTALL)
    if yaml_match:
        content = yaml_match.group(2)
    else:
        content = markdown_content
    
    # Remove images (both inline and reference style)
    content = re.sub(r'!\[.*?\]\(.*?\)', '', content)
    content = re.sub(r'!\[.*?\]\[.*?\]', '', content)
    content = re.sub(r'!\[.*?\]:\s*.*?(?:\s|$)', '', content)
    
    # Remove HTML img tags
    content = re.sub(r'<img[^>]*/?>', '', content, flags=re.IGNORECASE)
    content = re.sub(r'<img[^>]*>.*?</img>', '', content, flags=re.IGNORECASE)
    
    # Remove other markdown formatting
    content = re.sub(r'[#*`\[\]()_~]', '', content)
    content = re.sub(r'\n+', ' ', content)
    content = content.strip()
    
    words = content.split()
    if len(words) <= max_words:
        return content
    else:
        return ' '.join(words[:max_words]) + '...'

def generate_rss_feed(items_data, output_dir, feed_filename="feed.xml", site_url="https://jonwhite.me", site_title="Jon White's Blog", site_description="Latest posts from my personal blog"):
    """Generate a clean RSS 2.0 feed using ElementTree."""
    if not items_data:
        return

    sorted_items = sorted(items_data, key=lambda x: parse_date(x[2]), reverse=True)
    
    rss = ET.Element('rss', {
        'version': '2.0',
        'xmlns:atom': 'http://www.w3.org/2005/Atom'
    })
    channel = ET.SubElement(rss, 'channel')
    
    ET.SubElement(channel, 'title').text = site_title
    ET.SubElement(channel, 'link').text = site_url
    ET.SubElement(channel, 'description').text = site_description
    ET.SubElement(channel, 'language').text = 'en-us'
    ET.SubElement(channel, 'lastBuildDate').text = formatdate(usegmt=True)
    
    clean_site_url = site_url.rstrip('/')
    ET.SubElement(channel, '{http://www.w3.org/2005/Atom}link', {
        'href': f"{clean_site_url}/{feed_filename}",
        'rel': 'self',
        'type': 'application/rss+xml'
    })

    for title, link, date_val, description in sorted_items:
        clean_link = link.replace('\\', '/').lstrip('./')
        item_url = f"{clean_site_url}/{clean_link}"
        
        dt = parse_date(date_val)
        pub_date = formatdate(time.mktime(dt.timetuple()), usegmt=True)

        item = ET.SubElement(channel, 'item')
        ET.SubElement(item, 'title').text = title
        ET.SubElement(item, 'link').text = item_url
        
        guid = ET.SubElement(item, 'guid', {'isPermaLink': 'true'})
        guid.text = item_url
        
        ET.SubElement(item, 'pubDate').text = pub_date
        ET.SubElement(item, 'description').text = description or ''

    rough_string = ET.tostring(rss, encoding='utf-8')
    reparsed = minidom.parseString(rough_string)
    pretty_xml = reparsed.toprettyxml(indent="  ")

    feed_file = os.path.join(output_dir, feed_filename)
    with open(feed_file, 'w', encoding='utf-8') as f:
        f.write(pretty_xml)
    
    print(f"Generated RSS feed: {os.path.relpath(feed_file)}")

def generate_site():
    # Paths
    templates_dir = '../src/templates'
    pages_dir = '../src/pages'
    posts_dir = '../src/posts'
    notes_dir = '../src/notes'
    output_pages_dir = '../pages'
    output_posts_dir = '../posts'
    output_notes_dir = '../notes'
    output_dir = '../'
    
    # Load templates
    page_template = load_template(os.path.join(templates_dir, 'page.html'))
    post_template = load_template(os.path.join(templates_dir, 'post.html'))
    index_template = load_template(os.path.join(templates_dir, 'index.html'))
    
    try:
        blog_template = load_template(os.path.join(templates_dir, 'blog.html'))
    except FileNotFoundError:
        print("Warning: blog.html template not found. Blog pages will not be generated.")
        blog_template = None
        
    try:
        notes_template = load_template(os.path.join(templates_dir, 'notes.html'))
    except FileNotFoundError:
        print("Warning: notes.html template not found.")
        notes_template = None
        
    try:
        note_template = load_template(os.path.join(templates_dir, 'note.html'))
    except FileNotFoundError:
        print("Warning: note.html template not found.")
        note_template = None
    
    # Create output directories if they don't exist
    os.makedirs(output_pages_dir, exist_ok=True)
    os.makedirs(output_posts_dir, exist_ok=True)
    os.makedirs(output_notes_dir, exist_ok=True)
    
    # Collect posts and notes data
    posts_data = []
    notes_data = []
    
    # Process pages
    if os.path.exists(pages_dir):
        for markdown_file in os.listdir(pages_dir):
            if markdown_file.endswith('.md'):
                file_path = os.path.join(pages_dir, markdown_file)
                html_content, front_matter = convert_markdown_to_html(file_path, page_template)
                output_file = os.path.join(output_pages_dir, markdown_file.replace('.md', '.html'))
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write(html_content)
    
    # Process posts
    if os.path.exists(posts_dir):
        for markdown_file in os.listdir(posts_dir):
            if markdown_file.endswith('.md'):
                file_path = os.path.join(posts_dir, markdown_file)
                html_content, front_matter = convert_markdown_to_html(file_path, post_template)
                output_file = os.path.join(output_posts_dir, markdown_file.replace('.md', '.html'))
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write(html_content)
                
                # Extract excerpt for blog pages
                with open(file_path, 'r', encoding='utf-8') as f:
                    markdown_content = f.read()
                excerpt = extract_excerpt(markdown_content)
                
                post_link = os.path.relpath(output_file, output_dir).replace('\\', '/')
                posts_data.append((
                    front_matter.get('title', 'Untitled'), 
                    post_link, 
                    front_matter.get('date', 'Unknown Date'),
                    excerpt
                ))
                
    # Process notes
    if os.path.exists(notes_dir) and note_template:
        for markdown_file in os.listdir(notes_dir):
            if markdown_file.endswith('.md'):
                file_path = os.path.join(notes_dir, markdown_file)
                with open(file_path, 'r', encoding='utf-8') as f:
                    markdown_raw = f.read()
                
                yaml_match = re.match(r'---\s*\n(.*?)\n---\s*\n(.*)', markdown_raw, re.DOTALL)
                if yaml_match:
                    front_matter = yaml.safe_load(yaml_match.group(1)) or {}
                    body = yaml_match.group(2)
                else:
                    front_matter = {}
                    body = markdown_raw
                    
                note_html_body = markdown.markdown(body)
                slug = markdown_file.replace('.md', '')
                date_val = front_matter.get('date', datetime.now())
                date_obj = parse_date(date_val)
                date_str = format_display_date(date_val)
                
                title = front_matter.get('title')
                if not title:
                    title = f"Note - {date_str}"
                    
                syndication = front_matter.get('syndication')
                syndication_html = format_syndication_html(syndication)
                
                # Single note page
                single_html = note_template.replace('{{page_content}}', note_html_body)
                single_html = single_html.replace('{{title}}', title)
                single_html = single_html.replace('{{date}}', date_str)
                single_html = single_html.replace('{{syndication_html}}', syndication_html)
                single_html = single_html.replace('{{year}}', str(datetime.now().year))
                
                output_file = os.path.join(output_notes_dir, f"{slug}.html")
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write(single_html)
                    
                note_link = os.path.relpath(output_file, output_dir).replace('\\', '/')
                notes_data.append({
                    'slug': slug,
                    'date_obj': date_obj,
                    'date_str': date_str,
                    'title': title,
                    'html_content': note_html_body,
                    'syndication_html': syndication_html,
                    'link': note_link,
                    'body': body
                })
    
    # Generate index.html (show latest 5 posts)
    posts_list_html = ''
    sorted_posts = sorted(posts_data, key=lambda x: parse_date(x[2]), reverse=True)
    for title, link, date_val, excerpt in sorted_posts[:5]:
        date_display = format_display_date(date_val, include_time_if_present=False)
        posts_list_html += f'<li><a href="{link}">{title}</a> - {date_display}</li>\n'
   
    final_index_content = index_template.replace('{{post_list}}', '<ul>'+posts_list_html+'</ul>')
    final_index_content = final_index_content.replace('{{year}}', str(datetime.now().year))
   
    with open(os.path.join(output_dir, 'index.html'), 'w', encoding='utf-8') as index_file:
        index_file.write(final_index_content)
    
    # Generate blog pages with pagination in posts directory
    if blog_template:
        generate_blog_pages(posts_data, blog_template, output_posts_dir, posts_per_page=10)

    # Generate notes pages with pagination in notes directory
    if notes_template and notes_data:
        generate_notes_pages(notes_data, notes_template, output_notes_dir, notes_per_page=15)

    # Generate Blog RSS Feed
    generate_rss_feed(
        items_data=posts_data,
        output_dir=output_dir,
        feed_filename="feed.xml",
        site_url="https://jonwhite.me",
        site_title="Jon White's Blog",
        site_description="Latest posts from my personal blog"
    )

    # Generate Notes RSS Feed
    if notes_data:
        notes_rss_items = []
        for n in notes_data:
            notes_rss_items.append((
                n['title'],
                n['link'],
                n['date_obj'],
                n['html_content']
            ))
        generate_rss_feed(
            items_data=notes_rss_items,
            output_dir=output_dir,
            feed_filename="notes-feed.xml",
            site_url="https://jonwhite.me",
            site_title="Jon White's Notes",
            site_description="Micro-notes and updates from Jon White"
        )

    print(f"Site generated in {output_dir}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Jon White's Site Generator")
    parser.add_argument('--syndicate', action='store_true', help="Run POSSE syndication to Mastodon and Bluesky for unposted notes before generating site")
    parser.add_argument('--dry-run', action='store_true', help="Preview POSSE syndication without actually publishing to social networks")
    args = parser.parse_args()
    
    if args.syndicate or args.dry_run:
        from posse import syndicate_notes
        syndicate_notes(dry_run=args.dry_run)
        
    generate_site()