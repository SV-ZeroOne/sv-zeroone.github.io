---
layout: default
title: Tags
permalink: /tags/
---

# Tags

<p class="tag-cloud">
{% assign sorted = site.tags | sort %}
{% for t in sorted %}<a href="#{{ t[0] | slugify }}">#{{ t[0] }} <small>({{ t[1] | size }})</small></a> {% endfor %}
</p>

{% for t in sorted %}
<h2 id="{{ t[0] | slugify }}">#{{ t[0] }}</h2>
<ul>
  {% for post in t[1] %}
  <li><a href="{{ post.url | relative_url }}">{{ post.title }}</a> <small>{{ post.date | date: "%-d %b %Y" }}</small></li>
  {% endfor %}
</ul>
{% endfor %}
