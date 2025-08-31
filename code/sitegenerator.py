import os
import markdown
import yaml
import re
import math
from datetime import datetime

def load_template(template_path):
    with open(template_path, 'r', encoding='utf-8') as file:
        return file.read()

def convert_markdown_to_html(markdown_file_path, template):
    with open(markdown_file_path, 'r', encoding='utf-8') as markdown_file:
        markdown_content = markdown_file.read()
    
    # Extract YAML front matter
    yaml_match = re.match(r'---\s*\n(.*?)\n---\s*\n(.*)', markdown_content, re.DOTALL)
    if yaml_match:
        yaml_content = yaml_match.group(1)
        markdown_content = yaml_match.group(2)  # Markdown content without YAML
        front_matter = yaml.safe_load(yaml_content)
    else:
        front_matter = {}
    
    # Convert Markdown to HTML
    html_content = markdown.markdown(markdown_content)
    
    # Replace placeholders in the template
    final_content = template.replace('{{page_content}}', html_content)
   
    title = front_matter.get('title', 'Untitled')
    date = front_matter.get('date', 'Unknown Date')
    
    # Convert date to string if it's a date object
    if isinstance(date, (str, type(None))):
        date_str = date
    else:
        date_str = date.strftime('%Y-%m-%d')  # or another format like '%B %d, %Y'
    
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
        # Main blog page (/posts/index.html)
        path_prefix = ""
    else:
        # Subpages (/posts/page/X/index.html) - need to go up two levels
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
    sorted_posts = sorted(posts_data, key=lambda x: x[2], reverse=True)
    total_posts = len(sorted_posts)
    total_pages = math.ceil(total_posts / posts_per_page)
    
    for page in range(1, total_pages + 1):
        start_idx = (page - 1) * posts_per_page
        end_idx = start_idx + posts_per_page
        page_posts = sorted_posts[start_idx:end_idx]
        
        # Generate posts list HTML for this page
        posts_list_html = '<div class="blog-posts">\n'
        for title, link, date, excerpt in page_posts:
            # Calculate correct relative link based on page depth
            if page == 1:
                # Main blog page is at /posts/index.html, so posts are in same directory
                relative_link = os.path.basename(link)
            else:
                # Subpages are at /posts/page/X/index.html, so posts are two levels up
                relative_link = f"../../{os.path.basename(link)}"
            
            posts_list_html += f'  <article class="blog-post-preview">\n'
            posts_list_html += f'    <h2><a href="{relative_link}">{title}</a></h2>\n'
            posts_list_html += f'    <p class="post-date">{date}</p>\n'
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
            # Main blog page at /posts/index.html
            output_file = os.path.join(output_posts_dir, 'index.html')
        else:
            # Paginated pages at /posts/page/2/index.html, etc.
            page_dir = os.path.join(output_posts_dir, 'page', str(page))
            os.makedirs(page_dir, exist_ok=True)
            output_file = os.path.join(page_dir, 'index.html')
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(page_content)
        
        print(f"Generated blog page: {os.path.relpath(output_file)}")

def extract_excerpt(markdown_content, max_words=50):
    """Extract an excerpt from markdown content, stripping images and formatting"""
    # Remove YAML front matter
    yaml_match = re.match(r'---\s*\n(.*?)\n---\s*\n(.*)', markdown_content, re.DOTALL)
    if yaml_match:
        content = yaml_match.group(2)
    else:
        content = markdown_content
    
    # Remove images (both inline and reference style)
    content = re.sub(r'!\[.*?\]\(.*?\)', '', content)  # ![alt](url)
    content = re.sub(r'!\[.*?\]\[.*?\]', '', content)  # ![alt][ref]
    content = re.sub(r'!\[.*?\]:\s*.*?(?:\s|$)', '', content)  # ![ref]: url
    
    # Remove HTML img tags (both self-closing and with closing tags)
    content = re.sub(r'<img[^>]*/?>', '', content, flags=re.IGNORECASE)  # <img ...> or <img ... />
    content = re.sub(r'<img[^>]*>.*?</img>', '', content, flags=re.IGNORECASE)  # <img>...</img>
    
    # Remove other markdown formatting
    content = re.sub(r'[#*`\[\]()_~]', '', content)
    content = re.sub(r'\n+', ' ', content)
    content = content.strip()
    
    # Get first max_words words
    words = content.split()
    if len(words) <= max_words:
        return content
    else:
        return ' '.join(words[:max_words]) + '...'

def generate_site():
    # Paths
    templates_dir = '../src/templates'
    pages_dir = '../src/pages'
    posts_dir = '../src/posts'
    output_pages_dir = '../pages'
    output_posts_dir = '../posts'
    output_dir = '../'
    
    # Load templates
    page_template = load_template(os.path.join(templates_dir, 'page.html'))
    post_template = load_template(os.path.join(templates_dir, 'post.html'))
    index_template = load_template(os.path.join(templates_dir, 'index.html'))
    
    # Load blog template (create this new template)
    try:
        blog_template = load_template(os.path.join(templates_dir, 'blog.html'))
    except FileNotFoundError:
        print("Warning: blog.html template not found. Blog pages will not be generated.")
        blog_template = None
    
    # Create output directories if they don't exist
    os.makedirs(output_pages_dir, exist_ok=True)
    os.makedirs(output_posts_dir, exist_ok=True)
    
    # Collect posts data for index page and blog pages
    posts_data = []
    
    # Process pages
    for markdown_file in os.listdir(pages_dir):
        if markdown_file.endswith('.md'):
            file_path = os.path.join(pages_dir, markdown_file)
            html_content, front_matter = convert_markdown_to_html(file_path, page_template)
            output_file = os.path.join(output_pages_dir, markdown_file.replace('.md', '.html'))
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(html_content)
    
    # Process posts
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
            
            # Collect data for index page and blog pages
            post_link = os.path.relpath(output_file, output_dir)
            posts_data.append((
                front_matter.get('title', 'Untitled'), 
                post_link, 
                front_matter.get('date', 'Unknown Date'),
                excerpt
            ))
    
    # Generate index.html (show latest 5 posts)
    posts_list_html = ''
    for title, link, date, excerpt in sorted(posts_data, key=lambda x: x[2], reverse=True)[:5]:
        posts_list_html += f'<li><a href="{link}">{title}</a> - {date}</li>\n'
   
    final_index_content = index_template.replace('{{post_list}}', '<ul>'+posts_list_html+'</ul>')
    final_index_content = final_index_content.replace('{{year}}', str(datetime.now().year))
   
    with open(os.path.join(output_dir, 'index.html'), 'w', encoding='utf-8') as index_file:
        index_file.write(final_index_content)
    
    # Generate blog pages with pagination in posts directory
    if blog_template:
        generate_blog_pages(posts_data, blog_template, output_posts_dir, posts_per_page=10)
    
    print(f"Site generated in {output_dir}")

# Run the generator
generate_site()