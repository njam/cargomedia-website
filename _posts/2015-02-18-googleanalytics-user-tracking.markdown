---
layout: post
title: "Tracking User Events in Google Analytics from the Server-side"
date: 2015-02-18 17:00:00
owner: Reto
tags: [google analytics,tracking,measurement protocol]
---

Google Analytics' new *Universal Analytics* tracks [User IDs](https://developers.google.com/analytics/devguides/collection/analyticsjs/user-id) and therefore allows to connect multiple sessions (even across devices) from the same user.

![GA Users](/img/posts/2015/ga-users.png)

Additionally it's now possible to collect data over GA's new HTTP API [*Measurement Protocol*](https://developers.google.com/analytics/devguides/collection/protocol/v1/).
One can send POST requests to a URL to track *page views*, *events*, *e-commerce* etc.

This allows one to track events for users that happen independently of any user interaction!

<!--more-->

Imagine you bill your customers monthly for using your application. In the instant when the payment happens the user might not be using the application.
Nevertheless you can send a POST request to Google Analytics to collect an e-commerce transaction.

Universal Analytics knows the two parameters `cid` (*clientId*) to identify a session by its cookie, and `uid` (*userId*) to identify a user by your application's user-id.
The `cid` is a required parameter, and `uid` is optional.

How does GA handle such server-side sent hits? To find out the details I went ahead and sent some *events* to the REST API:

- Example6: This event sent a `uid` and a `cid` that were both also used to browse the site with normal `analytics.js`.
- Example7: This event sent a `uid` that was used with browsing the site, but a `cid` that was *made up*.

Both events were tracked properly, and assigned to the same user:
![GA Sessions](/img/posts/2015/ga-sessions-users.png)

It's important to notice that GA will treat the server sending the events as a normal client. It will use its Browser, Location etc (although you can override that with additional parameters):
![GA Browsers](/img/posts/2015/ga-browsers.png)

The new *Measurement Protocol* is very powerful, and allows for use cases that were not previously possible.
One can send an arbitrary (unique) session/cookie identifier, and use the *userId* to actually identify the user.

Next we will try to find out whether such `uid`-identified events can be used as goals for *AdWords Optimizer*…
