---
layout: post
title: "Short introduction to scrutinizer"
date: 2014-02-20
owner: Marian
tags: [scrutinizer, continuous inspection, analysis tools]
---

Some days ago, we decided to have a look at [scrutinizer](https://scrutinizer-ci.com/) and how this service can help us to improve our code.
To explain what scrutinizer is about, here is a short explanation from their website:

> scrutinizer ci is a hosted continuous inspection service for open-source as well as private code.
> It runs static code analysis tools, runtime inspectors, and can also run your very own checks in your favorite language.

*For more info check their [website](https://scrutinizer-ci.com/).*

For now, we just implemented their service and setup the basic configurations.

As a first usage, we can see if the new pushed code creates new issues/errors during the scrutinizer analysis
and how they recommend to change the code.

<!--more-->

### How to get the info about new errors

If you create a new pull-request at github, scrutinizer immediately starts analysing the code.
Scrutinizer will add a comment to your pull-request with a link to the ongoing analysis process.
After the analysis is finished, scrutinizer will update the comment with the actual test result.

![Link finished](/img/posts/2014/scrutinizer-link-finished.png)

If you click the link, you will see how your code-changes affect the master-branch.

![Overview about the status](/img/posts/2014/scrutinizer-overview-about-the-status.png)

In the above example, you see that the code-changes resolved some issues, but also created a new one.
By clicking the "1 issue" link, you can have a detailed look at what changes caused this error and how you could resolve it.

![Overview about the issues](/img/posts/2014/scrutinizer-overview-about-the-issues.png)

As you can see, a new Bug was found in the code.
Follow the link to the affected file and see the error with a suggestion how to fix it.

![Error report](/img/posts/2014/scrutinizer-error-report.png)

Once you have resolved the error and pushed your new code, scrutinizer will restart the process and verify your fix.

____

This was just a short overview of how we could benefit from this powerful tool.
There are a lot more interesting things to discover.
E.g. analysing existing code, code coverage by phpunit, ...

Just have a look and try it out. Let me know how this works out for you.
What additional experience do you have with scrutinizer?
Could you cover all bugs/errors?
Does this tool make sense to you at all?

Like to hear your thoughts.

Cheers,
Marian
