import markdown
import yaml
import re

def generate_site():
    #posts
    
    #index

def generate_static_page(template_path, markdown_path, output_path):
    # Read the template HTML file
    with open(template_path, 'r', encoding='utf-8') as template_file:
        template_content = template_file.read()

    # Read the Markdown file
    with open(markdown_path, 'r', encoding='utf-8') as markdown_file:
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
    final_content = template_content.replace('{{page_content}}', html_content)
    
    title = front_matter.get('title', 'Untitled')
    date = front_matter.get('date', 'Unknown Date')

    # Convert date to string if it's a date object
    if isinstance(date, (str, type(None))):
        date_str = date
    else:
        date_str = date.strftime('%Y-%m-%d')  # or another format like '%B %d, %Y'

    final_content = final_content.replace('{{page_title}}', title)
    final_content = final_content.replace('{{page_date}}', date_str)

    

    # Write the final HTML content to a new file
    with open(output_path, 'w', encoding='utf-8') as output_file:
        output_file.write(final_content)

    print(f"Static site generated: {output_path}")

# Example usage

template_path = "P:\Source\Repos\SiteGenerator\src\\templates\post.html"
markdown_path = 'P:\Source\Repos\SiteGenerator\src\\post\sample.md'
output_path = 'P:\Source\Repos\SiteGenerator\site\post\sample.html'

generate_static_page(template_path, markdown_path, output_path)