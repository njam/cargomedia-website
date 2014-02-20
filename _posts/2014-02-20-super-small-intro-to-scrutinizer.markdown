---
layout: post
title: "Super small introduction into scrutinizer"
date: 2014-02-20
owner: Marian
tags: [scrutinizer, continuous inspection, analysis tools]
---

Some days ago we decided to have a look on [scrutinizer](https://scrutinizer-ci.com/) and how this service can help us to improving our code.
To explain what scrutinizer is about here is a short explanation from there website:

> scrutinizer ci is a hosted continuous inspection service for open-source as well as private code.
> It runs static code analysis tools, runtime inspectors, and can also run your very own checks in your favorite language.

*For more infos about it check out there [website](https://scrutinizer-ci.com/).*

For now we just implemented there service and setup the basic configurations.
The first value we can get out of it is to see if the new pushed code creates new issues/errors during the scrutinizer analytics
and how they recommend to change this.

<!--more-->

### How to get the info about new errors

If you create a new pull-request at github scrutinizer always starts analysing this.
Scrutinizer will add a comment to you pull-request with a link where you can see the ongoing analytics.
After the analytics is finished scrutinizer will update the comment with the actual result on the test.

![Link finished](/img/posts/2014/scrutinizer-link-finished.png)

If you click the link you will see how your code changes affect the master.

![Overview about the status](/img/posts/2014/scrutinizer-overview-about-the-status.png)

In this case you see that your code changes resolved some issues but also create new ones.
Now you can have a detail look what changes are caused this error an how you could resolve them by clicking the "1 issue" link.

![Overview about the issues](/img/posts/2014/scrutinizer-overview-about-the-issues.png)

You see now that in this case 1 new Bug was found in you code.
If you now click on the path-link you will see in which line the error is and a suggest how you can resolve this.

![Error report](/img/posts/2014/scrutinizer-error-report.png)

Once you have resolved the error and pushed your new code scrutinizer will start again the process and the error should not show ut again.

This was just a short overview how we should start using this powerful tool.
There are a lot more interesting things to find out like what error are in the "master" code,
how the code coverage (unittest) is covering the code or how "good" you code is in general.

Just have a look try it out and let me know if this works out for you.
What else could you find out about the code?
Could you cover all bugs/errors?
Does this makes sense to you at all?

Like to hear your thoughts about it.

Cheers,
Marian
