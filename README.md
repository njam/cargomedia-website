cargomedia-website
==================
Company website - http://www.cargomedia.ch/

[![Build Status](https://img.shields.io/travis/cargomedia/cargomedia-website/master.svg)](https://travis-ci.org/cargomedia/cargomedia-website)


Prismic CMS
-----------

The website loads content from a Prismic-CMS account.

https://cargomediach.prismic.io/


Jekyll Blog
-----------

Blogposts are stored in this repository and rendered with Jekyll.

- All posts are stored in the `_posts/` folder
- Images from posts are stored in the `img/posts/[year]/` folder

To add a blogpost:
- Add a file with naming convention date-title.markdown (e.g. `2013-2-22-New-Post.markdown`) into `_posts/`
- Add post meta information (YAML), followed by markdown
- Use `<!--more-->` to slice your blogpost (only the content above is shown in preview mode)
- Include images using e.g `![Image Title](/img/posts/2013/customImage.jpg)`
- Include code using [Liquid](http://docs.shopify.com/themes/liquid-basics) syntax


Development
-----------

Install dependencies
```
bundle install
npm install
```

Build the site and serve it on http://localhost:4000:
```
grunt develop
```
…this will also watch for changes, rebuild and trigger a *live reload*.

Deployment
----------
Deployment to [Firebase hosting](https://console.firebase.google.com/project/cargomedia-website/hosting/main)
is triggered from Travis CI, or manually by running `firebase deploy`.
