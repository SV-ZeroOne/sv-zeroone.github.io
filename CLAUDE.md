# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The "Zero Security" personal site (sv-zeroone.github.io). It is a Jekyll 4 site with a customized copy of the [pages-themes/hacker](https://github.com/pages-themes/hacker) theme kept in the repo (`_layouts/`, `_includes/`, `_sass/`). The theme gem is not used. Content is Markdown with some inline HTML.

## Build and deploy

`.github/workflows/pages.yml` builds the site with Ruby (version from `.ruby-version`) and the committed `Gemfile.lock`, then runs html-proofer on internal links and images. It runs on pushes to `master`, pull requests, manual dispatch and a daily schedule (to refresh the homepage feeds), but deploys to GitHub Pages only from `master`. GitHub's built-in "deploy from branch" build is not used, so any plugin works, but a plugin must be in both the `Gemfile` `:jekyll_plugins` group and `_config.yml` `plugins:`.

Other automation:
- `.github/workflows/links.yml` builds the site every Monday and runs `script/check_external_links.rb` (html-proofer, external links, 4xx only). On failure it opens an issue labelled `broken-links`, or comments on the open one.
- `.github/dependabot.yml` opens weekly grouped PRs for gems and Actions.
- `.gitattributes` keeps text files LF in the working tree.

The old built-in build silently added some plugins, and the move to Actions changed two things the site relies on:
- `jekyll-titles-from-headings` has been re-added explicitly: pages without `title:` (all writeups) take their `<title>` from their first heading.
- The `site.github.*` metadata (from `jekyll-github-metadata`) is gone. The layout uses `site.repository_url` from `_config.yml` instead.

## Commands

Ruby 3.4 with Devkit is installed at `C:\Ruby34-x64` (RubyInstaller). If `ruby` isn't on PATH in the current shell, prefix it with `$env:Path = "C:\Ruby34-x64\bin;$env:Path"` (PowerShell).

```sh
bundle install                                     # install gems from Gemfile.lock
bundle exec jekyll serve                           # local preview at http://localhost:4000
bundle exec jekyll serve --drafts                  # also render _drafts/
bundle exec jekyll build                           # build into _site/
bundle exec htmlproofer ./_site --disable-external --ignore-urls "/pagefind/"  # same link/image check as CI
npx -y pagefind@1.3.0 --site _site --serve         # after a build: index + serve, to try /search/ locally (port 1414)
bundle exec ruby script/check_external_links.rb    # external link check (slow, network)
SECURITY_FEEDS=off bundle exec jekyll serve        # skip fetching the homepage feeds (offline)
```

On Windows, run html-proofer as `ridk exec bundle exec htmlproofer ...`. It needs libcurl, which comes from the MSYS2 package `mingw-w64-ucrt-x86_64-curl`, copied to `C:\Ruby34-x64\msys64\ucrt64\bin\libcurl.dll` so the ethon gem can find it.

There are no tests. A build followed by html-proofer is the check that a change works. After changing the `Gemfile` on Windows, keep the lockfile usable on CI with `bundle lock --add-platform x86_64-linux`.

## Content structure

There are two kinds of content, and they get onto the site differently:

- **Blog posts**: `_posts/YYYY-MM-DD-slug.md` with front matter `author: zero`, `title: "..."` and space-separated `tags:`. `layout: post` comes from `defaults` in `_config.yml`. Posts also feed `/feed.xml` (jekyll-feed). `blog/main-blog.md` lists them automatically, showing `post.excerpt` (the first paragraph), so the opening paragraph serves as the post's summary. Post URLs use Jekyll's default permalink, `/YYYY/MM/DD/slug.html`, which is how posts link to each other.
- **CTF/lab writeups**: the `writeups` collection in `_writeups/<slug>.md`, published at `/writeups/<slug>.html` (permalink `/writeups/:path:output_ext`; these URLs predate the collection, so don't change it). Front matter: `platform` (VulnHub / TryHackMe / HackTheBox), `machine` (link text) and `order` (sort position). `writeups/main-writeups.md` builds the index from these fields, grouped by platform in a fixed order, so a new platform must also be added to its `platforms` list. Layout comes from `defaults`, and the page title comes from the first heading (`titles_from_headings.collections: true`). Start new writeups from `_templates/writeup.md`.

Images go in `assets/images/`. Writeups use a per-machine subfolder (e.g. `assets/images/thm_ultratech/`), and recent posts put files directly in the folder. Pages reference them with root-absolute paths (`/assets/images/...`).

## Site-level details

- `_config.yml` sets the title/description, `url`, `repository_url`, `lang` (en-GB), `timezone` (Europe/London), plugins, `defaults` and `exclude`.
- Analytics: `google_analytics` (GA4 `G-…` ID, `_includes/google-analytics.html` in `<head>`) and `cloudflare_analytics` (Cloudflare Web Analytics beacon token, cookie-free, `_includes/cloudflare-analytics.html` before `</body>`). Each is emitted only when it is set and `JEKYLL_ENV=production` (CI sets this), so local previews aren't tracked. Remove a key to turn that tracker off.
- Plugins in use: jekyll-seo-tag, jekyll-titles-from-headings, jekyll-feed, jekyll-sitemap (also writes `robots.txt`), jemoji. Emoji codes must be valid gemoji names (e.g. `:hole: :computer:` on the writeup intro lines). Unknown codes render as literal text, and codes inside code blocks are left alone. Repo-only files (README, CLAUDE.md, LICENSE) must be listed in `exclude`, or Jekyll copies them into the published site. The header nav buttons (Write-ups, Blog Posts) are hard-coded in `_layouts/default.html`, and the footer comes from `_includes/footer.html`.
- The Sass uses `@use` (not the deprecated `@import`). Partials that need the color variables do `@use "default_colors" as *;`. Custom CSS classes (e.g. `.center_robot`, `.center_twitter`) are appended to `_sass/jekyll-theme-hacker.scss`.
- The homepage "Latest exploits" and "Known exploited vulnerabilities" lists come from `_plugins/security_feeds.rb`. It fetches the Exploit-DB RSS feed and the CISA KEV JSON at build time into `site.data.security_feeds`, which `_includes/security-feeds.html` renders. A failed fetch logs a warning and renders "Feed unavailable" instead of failing the build.
- Social cards: `jekyll-seo-tag` emits a default `og:image` (`/assets/og-default.png`) via the empty-scope `defaults` entry, with `twitter.card: summary_large_image`. Favicons (`assets/favicon.svg` cyber-cat, `favicon-32.png`, `apple-touch-icon.png`, `icon-512.png`) and the social card were generated by a one-off Pillow script (`generate_brand.py`) that is not in the repo; if the brand changes, regenerate all of them at the same sizes.
- Blog posts show clickable tags, prev/next nav and related-by-tag posts (`_layouts/post.html`). `/tags/` (`tags.md`) is a single index page with per-tag anchors; post tag links point at `/tags/#<slug>`. Pages: `/about/` (`about.md`), `/projects/` (`projects.md`), `/search/`.
- `_includes/terminal.html` is an interactive shell on the homepage (hardcoded command output plus navigation). Included from `index.md`.
- Search is Pagefind: `pages.yml` runs `npx pagefind@1.3.0 --site _site` after the Jekyll build and before html-proofer (which, like `script/check_external_links.rb`, ignores `/pagefind/`). `/search/` loads the generated `/pagefind/` UI, so search only works on the deployed site, not local `jekyll serve`.
- `_includes/about-bg.html` is the `/about/` background: a fixed canvas (`z-index:-1`, dark grey) with lime circuit traces (travelling pulses), IC chips and a big line-art fat cat with glowing eyes and a broadcasting antenna. Same style/colour as the skyline. Included from `about.md`.
- `_includes/home-bg.html` is the homepage background: a `position:fixed` full-viewport canvas (`z-index:-1`) drawing a line-art green city skyline with antennas that broadcast signal rings. Static skyline is pre-rendered to an offscreen canvas; only the rings animate. Reduced-motion renders one still. Included from `index.md`.
- `_includes/home-banner.html` is the homepage hero: a self-contained canvas animation (SDR waterfall, matrix rain, a network-node graph and pulsing antennas) with its own scoped CSS and script. It pauses off-screen/when hidden and renders a single still under reduced-motion. Included from `index.md`.
- `mycelial-nodes/index.html` is a standalone full-screen page (`layout: null`, its own `<head>` with `{% seo %}` and both analytics includes). It was converted from a Claude artifact, uses self-hosted fonts from `assets/fonts/mycelial/` (OFL licence files alongside), and is embedded in its blog post via the `.film-embed` iframe wrapper.
- Before publishing photos, strip EXIF metadata. Phone photos carry GPS coordinates, and some previously published images did.
