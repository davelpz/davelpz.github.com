---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults
title:  "Tags"
author: Admin
layout: default
---

<div class="home">
    {%- if page.title -%}
    <h1 class="page-heading">{{ page.title }}</h1>
    {%- endif -%}

{% capture site_tags %}{% for tag in site.tags %}{{ tag | first }}{% unless forloop.last %},{% endunless %}{% endfor %}{% endcapture %}
{% assign tags_list = site_tags | split:',' | sort_natural %}
<ul class='taglist'>
    {% for item in (0..site.tags.size) %}{% unless forloop.last %}
    {% capture this_word %}{{ tags_list[item] | strip_newlines }}{% endcapture %}
    <li><a href="#{{ this_word}}" class="tag"><span class="tag-name">{{ this_word }}</span>:<span class="count">{{ site.tags[this_word].size }}</span></a></li>
    {% endunless %}{% endfor %}
</ul>

{% for item in (0..site.tags.size) %}{% unless forloop.last %}
{% capture this_word %}{{ tags_list[item] | strip_newlines }}{% endcapture %}
<article id="{{ this_word }}">
    <h2 class="tag-heading tag-name">#{{ this_word }}</h2>
    <ul>
        {% for post in site.tags[this_word] %}{% if post.title != null %}
        <li><a href="{{ site.url }}{{ post.url }}" title="{{ post.title }}" >{{ post.date | date: '%m/%d/%Y' }} ---- {{ post.title }}</a></li>
        {% endif %}{% endfor %}
    </ul>
</article>
{% endunless %}{% endfor %}

</div>

