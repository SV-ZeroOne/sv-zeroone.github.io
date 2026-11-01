# Previewing the site locally

Quick reference for seeing the site rendered on this machine, exactly as GitHub
Pages will render it.

## TL;DR

```powershell
cd C:\Users\Neo\Desktop\Claude_Projects\sv-zeroone.github.io
.\Preview-Site.ps1
```

That builds the site (drafts included) and opens the Ludus post at
<http://127.0.0.1:4100/2026/10/13/building-a-cyber-range-with-ludus-on-a-mini-pc.html>.

| Want to…                              | Run                                               |
|---------------------------------------|---------------------------------------------------|
| Rebuild after editing a post          | `.\Preview-Site.ps1` then refresh the browser     |
| Open a different page                 | `.\Preview-Site.ps1 -Page /k8-range/`             |
| See only what the public site shows   | `.\Preview-Site.ps1 -NoDrafts`                    |
| Run the same link/image check as CI   | `.\Preview-Site.ps1 -Check`                       |
| Just open the existing build          | `.\Preview-Site.ps1 -SkipBuild -Page /`           |
| Stop the local web server             | `.\Preview-Site.ps1 -Stop`                        |

## How it works

There is no Ruby installed on this PC, so Jekyll runs inside Docker:

1. **Build.** The script runs the official `ruby:3.4` image with the repo mounted
   at `/srv` and executes `bundle install` + `bundle exec jekyll build --drafts`.
   Gems are cached in a Docker volume called `k8-blog-gems`, so the first build
   (a few minutes) is the only slow one. Output goes to `_site/`, which is
   git-ignored.
2. **Serve.** A Python one-liner, `python -m http.server 4100 --directory _site`,
   serves that folder on `http://127.0.0.1:4100/` (localhost only). It stays
   running in the background between builds; rebuilding just replaces the files.
3. **Open.** The script opens the requested page in your default browser.

`SECURITY_FEEDS=off` is set for local builds so the homepage "Latest exploits"
and CISA KEV lists show "Feed unavailable" instead of fetching. CI fetches them.

The manual equivalent, if you prefer to type it:

```powershell
docker run --rm -v "${PWD}:/srv" -v k8-blog-gems:/usr/local/bundle -w /srv -e SECURITY_FEEDS=off ruby:3.4 bash -c "bundle install --quiet && bundle exec jekyll build --drafts"
python -I -m http.server 4100 --bind 127.0.0.1 --directory _site
```

## Things to know

- **Drafts and dates.** Anything in `_drafts/` is included with `--drafts` and
  gets its URL date from the filename when it has one. To publish, move the
  file to `_posts/` and commit.
- **Search does not work locally.** `/search/` needs the Pagefind index, which
  only the GitHub Actions build creates.
- **Docker Desktop must be running.** The script starts it if the daemon is
  down and waits up to three minutes.
- **Port 4100 busy?** Something else is using it; stop it with
  `.\Preview-Site.ps1 -Stop`, or change `$port` at the top of the script.
- **Live reload** is deliberately not used. If you want it, run
  `docker run --rm -p 4000:4000 -v "${PWD}:/srv" -v k8-blog-gems:/usr/local/bundle -w /srv -e SECURITY_FEEDS=off ruby:3.4 bash -c "bundle exec jekyll serve --drafts --host 0.0.0.0 --force_polling"`
  and browse to <http://127.0.0.1:4000/>. File watching across the Windows
  mount needs `--force_polling`, which is why the one-shot build is the default.
