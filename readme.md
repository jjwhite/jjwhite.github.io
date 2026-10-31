## Serving the site
`http-server -p 3000`

## Generating the site
```
cd code
py sitegenerator.py
```

### Notes & POSSE Syndication
Short notes live in `src/notes/*.md`. You can publish on your site and syndicate to Mastodon and Bluesky via POSSE:

1. Copy `code/.env.example` to `code/.env` and add your Mastodon and Bluesky credentials.
2. Preview social posts without publishing:
   ```
   py sitegenerator.py --dry-run
   # or
   py posse.py --dry-run
   ```
3. Syndicate unposted notes and generate the site:
   ```
   py sitegenerator.py --syndicate
   ```
   Or run the standalone POSSE script:
   ```
   py posse.py
   ```
   Once published, the social post URLs are automatically written to the note's frontmatter and displayed on the site.


## Backlog
- logo/wordmark for "Jon White"
- add socials to footer
- add "plants" to background
- add rss feed
- add blogroll or links

## Posts
- write about creating this site

## Inspiration
- [localghost.dev](https://localghost.dev)
- [ohelloana.blog](https://ohhelloana.blog/) - I like the "main menu" idea
- [bell.bz](https://bell.bz/) - I like his music collection
- [lifenotes](https://carol.gg/blog/lifenotes-45/)
- [cassie codes](https://www.cassie.codes/) - I like the plant in her logo would be cool to have a lot plants on my site

## Monetization
- [ko-fi.com](https://ko-fi.com)
