# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The "Zero Security" personal site (sv-zeroone.github.io). It is a Jekyll 4 site with a customized copy of the [pages-themes/hacker](https://github.com/pages-themes/hacker) theme kept in the repo (`_layouts/`, `_includes/`, `_sass/`). The theme gem is not used. Content is Markdown with some inline HTML.

## Build and deploy

`.github/workflows/pages.yml` builds the site with Ruby (version from `.ruby-version`) and the committed `Gemfile.lock`, then runs html-proofer on internal links and images. It runs on pushes and pull requests but deploys to GitHub Pages only from `master`. GitHub's built-in "deploy from branch" build is not used, so any plugin works, but a plugin must be in both the `Gemfile` `:jekyll_plugins` group and `_config.yml` `plugins:`.

The old built-in build silently added some plugins. Two of them have been re-added explicitly because the site depends on them:
- `jekyll-titles-from-headings`: pages without `title:` (all writeups) take their `<title>` from their first heading.
- The `site.github.*` metadata is gone. The layout uses `site.repository_url` from `_config.yml` instead.

## Commands

Ruby 3.4 with Devkit is installed at `C:\Ruby34-x64` (RubyInstaller). If `ruby` isn't on PATH in the current shell, prefix it with `$env:Path = "C:\Ruby34-x64\bin;$env:Path"` (PowerShell).

```sh
bundle install                                     # install gems from Gemfile.lock
bundle exec jekyll serve                           # local preview at http://localhost:4000
bundle exec jekyll serve --drafts                  # also render _drafts/
bundle exec jekyll build                           # build into _site/
bundle exec htmlproofer ./_site --disable-external # same link/image check as CI
```

On Windows, run html-proofer as `ridk exec bundle exec htmlproofer ...`. It needs libcurl, which comes from the MSYS2 package `mingw-w64-ucrt-x86_64-curl`, copied to `C:\Ruby34-x64\msys64\ucrt64\bin\libcurl.dll` so the ethon gem can find it.

There are no tests. A build followed by html-proofer is the check that a change works. After changing the `Gemfile` on Windows, keep the lockfile usable on CI with `bundle lock --add-platform x86_64-linux`.

## Content structure

There are two kinds of content, and they get onto the site differently:

- **Blog posts**: `_posts/YYYY-MM-DD-slug.md` with front matter `author: zero`, `title: "..."` and space-separated `tags:`. `layout: post` comes from `defaults` in `_config.yml`. Posts also feed `/feed.xml` (jekyll-feed). Older posts have no `title`, so Jekyll derives it from the filename. `blog/main-blog.md` lists them automatically, showing `post.excerpt` (the first paragraph), so the opening paragraph serves as the post's summary. Post URLs use Jekyll's default permalink, `/YYYY/MM/DD/slug.html`, which is how posts link to each other.
- **CTF/lab writeups**: `writeups/*.md` with `layout: default`. They are not a collection, so each new writeup must be linked by hand in `writeups/main-writeups.md` under the right platform heading (VulnHub / TryHackMe / HackTheBox). Link with the `.html` extension. `_drafts/writeup_template.md` shows the expected section outline (recon/nmap, enumeration, privesc, summary, references).

Images go in `assets/images/`. Writeups use a per-machine subfolder (e.g. `assets/images/thm_ultratech/`), and recent posts put files directly in the folder. Pages reference them with root-absolute paths (`/assets/images/...`).

## Site-level details

- `_config.yml` sets the title/description, `url`, `repository_url`, `lang` (en-GB), `timezone` (Europe/London), plugins, `defaults` and `exclude`.
- `google_analytics` takes a GA4 `G-…` ID. `_includes/google-analytics.html` emits the gtag snippet only when it is set and `JEKYLL_ENV=production` (CI sets this), so local previews aren't tracked.
- Plugins in use: jekyll-seo-tag, jekyll-titles-from-headings, jekyll-feed, jekyll-sitemap (also writes `robots.txt`), jemoji. Emoji codes must be valid gemoji names (e.g. `:hole: :computer:` on the writeup intro lines). Unknown codes render as literal text, and codes inside code blocks are left alone. Repo-only files (README, CLAUDE.md, LICENSE) must be listed in `exclude`, or Jekyll copies them into the published site. The header nav buttons (Write-ups, Blog Posts) are hard-coded in `_layouts/default.html`, and the footer comes from `_includes/footer.html`.
- The Sass uses `@use` (not the deprecated `@import`). Partials that need the color variables do `@use "default_colors" as *;`. Custom CSS classes (e.g. `.center_robot`, `.center_twitter`) are appended to `_sass/jekyll-theme-hacker.scss`.
- `index.md` contains pre-rendered twitter-timeline HTML that was copied from a build that ran `jekyll-twitter-plugin`. The plugin is no longer installed.
