---
layout: post
title: "Infrastructure deployment with Puppet"
date: 2013-12-23
owner: Chris
tags: [puppet,deployment,serverspec]
---

After few months of hard work on new approach to infrastructure deployment we can say
that the choice of using [Puppet](http://puppetlabs.com/) was very good. We successfully
implemented large library of reusable modules for *Debian Wheezy*

<!--more-->
**We reached our goals:**

- master-agent and masterless deployment,
- easy modeling of physical infrastructure into code using [hiera](http://docs.puppetlabs.com/hiera/1/),
- store facts, reports, exported resources, catalogs for each machine into [PuppetDB](https://docs.puppetlabs.com/puppetdb/),
- easy to split common puppet classes/resources to public repos and specific resources e.g SSL, apps configs into private one,
- TDD using [serverspec](http://http://serverspec.org/). Continuous integration with [Travis](https://travis-ci.org/)
- and many more…

If you are interested in puppet please have a look on our open source set of
puppet modules at [Github](https://github.com/cargomedia/puppet-packages/)
