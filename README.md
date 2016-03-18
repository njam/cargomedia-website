cargomedia.github.io
====================

http://www.cargomedia.ch/

Static [jekyll](http://jekyllrb.com/) powered company website

- All posts are stored in the `_posts/` folder
- Images from posts are stored in the `img/posts/[year]/` folder

## Add Blogpost

- Add a file with naming convention date-title.markdown (e.g. `2013-2-22-New-Post.markdown`) into `_posts/`
- Add post meta information (YAML), followed by markdown
- Use `<!--more-->` to slice your blogpost (only the content above is shown in preview mode)
- Include images using e.g `![Image Title](/img/posts/2013/customImage.jpg)`
- Include code using [Liquid](http://docs.shopify.com/themes/liquid-basics) syntax

### Example

```
---
layout: post
title: "New Post"
date: 2012-11-27 22:16:08
owner: John
tags: [node.js, performance]
---

Your Blogpost goes here...

<!--more-->

...rest of the blogpost goes here.

// Images
![Image Title](/img/posts/2013/customImage.jpg)
```

## Test site locally

Make sure to install dependencies
```
bundle install
```
Build the site and serve it on `http://localhost:4000`
```
bundle exec jekyll serve --watch
```
