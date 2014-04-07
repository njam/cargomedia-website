---
layout: post
title: "Extending Puppetmaster module with Passenger"
date: 2014-03-20
owner: Chris
tags: [puppet, passenger, apache2]
---

If you manage a large farm of servers then most probably you experienced performance problems time to time.
To solve puppetmaster problems with handling many concurrent SSL connections the best solution
is to switch from [WEBrick](http://en.wikipedia.org/wiki/WEBrick) to [Apache2](http://httpd.apache.org/) as gateway for puppet agents.

<!--more-->

We can recommend implemented by our team the [puppet master module](https://github.com/cargomedia/puppet-packages/tree/master/modules/puppet)
which uses our [passenger module](https://github.com/cargomedia/puppet-packages/tree/master/modules/passenger).

More details about problems with WEBrick you can find in [issue here](https://github.com/cargomedia/puppet-packages/issues/502)
