---
layout: default
---

# Hacking Write-ups

This page contains links to write-ups I did about hacking various systems found on [TryHackMe](https://tryhackme.com/), [VulnHub](https://www.vulnhub.com/) and [HackTheBox](https://www.hackthebox.eu/)

{% comment %}Generated from the _writeups collection, grouped by `platform` and sorted by `order`.{% endcomment %}
{%- assign platforms = "VulnHub,TryHackMe,HackTheBox" | split: "," -%}
{%- for platform in platforms -%}
{%- assign writeups = site.writeups | where: "platform", platform -%}
{%- if writeups.size > 0 %}

## {{ platform }}

{% for writeup in writeups -%}
* [{{ writeup.machine }}]({{ writeup.url | relative_url }})
{% endfor -%}
{%- endif -%}
{%- endfor %}
