import os
import markdown
import yaml
import re
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

    # Create output directories if they don't exist
    os.makedirs(output_pages_dir, exist_ok=True)
    os.makedirs(output_posts_dir, exist_ok=True)

    # Collect posts data for index page
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

            # Collect data for index page
            post_link = os.path.relpath(output_file, output_dir)
            posts_data.append((front_matter.get('title', 'Untitled'), post_link, front_matter.get('date', 'Unknown Date')))

    # Generate index.html
    posts_list_html = ''
    for title, link, date in sorted(posts_data, key=lambda x: x[2], reverse=True)[:5]:
        posts_list_html += f'<li><a href="{link}">{title}</a> - {date}</li>\n'
    
    final_index_content = index_template.replace('{{post_list}}', '<ul>'+posts_list_html+'</ul>')
    final_index_content = final_index_content.replace('{{year}}', str(datetime.now().year))
    
    with open(os.path.join(output_dir, 'index.html'), 'w', encoding='utf-8') as index_file:
        index_file.write(final_index_content)

    print(f"Site generated in {output_dir}")

# Run the generator
generate_site()