---
layout: default
---

{% include home-bg.html %}

{% include home-banner.html %}

Welcome to Zero Security, a site dedicated to `Cyber Security`, `Ethical Hacking`, `Red Teaming` and `Penetration Testing` stuff.

{% include terminal.html %}

# Latest Blog Posts

<ul class="home-posts">
{% for post in site.posts limit:3 %}
  <li>
    <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
    <small class="home-post-date">{{ post.date | date: "%-d %B %Y" }}</small>
    <p>{{ post.excerpt | strip_html | truncatewords: 40 }}</p>
  </li>
{% endfor %}
</ul>

[All blog posts &rarr;](./blog/main-blog.html)

# Hacking Write-ups

Check out the write-ups for details on hacking into various different computer systems...

[Hacking Write-ups](./writeups/main-writeups.html)

<img class="center_robot" alt="Mr Robot" src="/assets/images/mr_robot_0.png" width="20%" height="20%">

{% include security-feeds.html %}

This site is a customized version of [The Hacker theme](https://github.com/pages-themes/hacker). Thank you to the contributors to that open sourced theme for providing a well made github pages theme template.
