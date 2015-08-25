---
layout: post
title: "PULSAR REST API"
date: 2015-06-23 11:10:00
owner: Chris
tags: [pulsar, rest, api, hipchat, capistrano, deployment, devops, automation, nodejs]
---

If you work in scale, If you manage multiple applications in multiple environments, If you automate any tasks using Capistrano then try a handy solutions which will improve and extend your workbench.

<!--more-->

### Real-life scenario

There are many automated tasks in everyday work. It is crucial to distribute the management of those tasks between not only DevOps anymore. 
The idea was for distributing small tasks on the Dev teams as well. One of the most important task is the deployment process 
of new release of every applications in multiple environments. It requires a very high level of permissions 
and orchestration of many actions by experienced DevOps. As we use [Pulsar](https://github.com/nebulab/pulsar) which 
is built on top of [Capistrano](https://github.com/capistrano/capistrano) we decided to extend that tool with REST interface. 
It allows us to talk easily over HTTP to our tasks. We do it via [Hubot](https://hubot.github.com/). 
This simple piece of software lets us to integrate [HipChat](https://www.hipchat.com/) (our communication channel) 
with simple BOT. It listens for our commands and trigger actions over pulsar-rest-api into pulsar itself.

Example of "app deployment" via HipChat using Hubot

![Hipchat Deployment](/img/posts/2015/hipchat-cargobot.png)

On the pulsar-rest-api interface it looks like on screenshot

![Pulsar-Rest-Api Dashboard](/img/posts/2015/pulsar-rest-api-dashboard.png)

In more details the workflow looks like follows

![Pulsar-Hipchat Workflow](/img/posts/2015/pulsar-hipchat-workflow.png)

### License

This project has been funded by [cargomedia](http://www.cargomedia.ch) as open-source.

### Where to go from here

Please go to GitHub repositories to find out why should you start using it now!

- [github pulsar-rest-api](https://github.com/cargomedia/pulsar-rest-api)
- [github pulsar-hubot](https://github.com/cargomedia/hubot-pulsar)
- [github pulsar-rest-api-client-node](https://github.com/cargomedia/pulsar-rest-api-client-node)

If you enjoy to use the PULSAR-REST-API or you need any help or advises, please let us know!

##### (this blogpost is crossposting of [kris-lab blog](http://blog.kris-lab.com/pulsar-rest-api/))
