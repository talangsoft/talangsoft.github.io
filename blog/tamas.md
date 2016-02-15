---
layout: page
title: Tech Blog
---
  <img style="float:left; display: block;" src="/assets/includes/divider-pencil.jpg"/>

  <div class="clear"/>
  <br/>
  <div class="posts">
    {% for post in site.posts%}
      {% if post.author_initials == "TL" %}
          <div class="post">
            <h2 class="post-title">
              <a href="{{ post.url }}">
                {{ post.title }}
              </a>
            </h2>
            <span class="post-date">{{ post.date | date_to_string }}</span>
            {{ post.description }}
            <br/>
            <a href="{{ post.url }}">
              More...
            </a>
            <hr/>
          </div>
      {% endif %}
    {% endfor %}
  </div>

