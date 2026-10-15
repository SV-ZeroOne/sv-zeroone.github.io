---
layout: default
title: Search
permalink: /search/
---

# Search

<link href="/pagefind/pagefind-ui.css" rel="stylesheet">
<div id="search"></div>
<p id="search-note" hidden>The search index is built when the site is deployed, so search runs on the live site. To preview it locally, build the index first:<br>
<code>bundle exec jekyll build &amp;&amp; npx -y pagefind@1.3.0 --site _site --serve</code><br>
then open the URL Pagefind prints (usually <code>http://localhost:1414</code>).</p>
<script src="/pagefind/pagefind-ui.js" onerror="var n=document.getElementById('search-note');if(n)n.hidden=false"></script>
<script>
  window.addEventListener('DOMContentLoaded', function () {
    if (window.PagefindUI) { new PagefindUI({ element: '#search', showImages: false, resetStyles: false }); }
    else { var n = document.getElementById('search-note'); if (n) n.hidden = false; }
  });
</script>

<noscript>Search needs JavaScript enabled.</noscript>
