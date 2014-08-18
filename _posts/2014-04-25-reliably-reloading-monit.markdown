---
layout: post
title: "Reliably Reloading Monit"
date: 2014-04-25
owner: Reto
tags: [monit, server monitoring, bash]
---

### Can't reload monit reliably
[Monit](http://mmonit.com/monit/) works in mysterious ways.
The service monitoring tool runs an HTTP server in a daemon process, which does all the dirty work.
If you interact with *monit* on the command line, you send an HTTP request to that server.
For example `monit unmonitor apache2` is in fact doing a `POST`-request to your local monit server.

Unfortunately all monit CLI commands are working *asynchronously*, meaning they exit before the actual task has been finished by the daemon process.
The same goes for reloading monit configuration. A `monit reload` sends a `SIGHUP` to the daemon process:

```
stat("/var/run/monit.pid", {st_mode=S_IFREG|0644, st_size=5, ...}) = 0
stat("/var/run/monit.pid", {st_mode=S_IFREG|0644, st_size=5, ...}) = 0
open("/var/run/monit.pid", O_RDONLY)    = 4
fstat(4, {st_mode=S_IFREG|0644, st_size=5, ...}) = 0
mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f065875b000
read(4, "7860\n", 4096)                 = 5
close(4)                                = 0
munmap(0x7f065875b000, 4096)            = 0
getpgid(0x1eb4)                         = 7859
kill(7860, SIGHUP)
```

This becomes especially problematic if you run multiple monit commands immediately after each other:

```
monit reload; monit unmonitor apache2
```

The above command will **not** unmonitor apache! It seems the unmonitor-command reaches monit in a state where it's still reloading.

<!--more-->

### The workaround

The most reliable way to create a *blocking* script for reloading monit we've found is to check the *file modification time* of monit's *state file*.

Monit modifies `/root/.monit.state` when reloading, so if its modify time has changed we can assume the reload was finished.
Here's a version of `monit-reload.sh`:

{% highlight bash %}
function getStateAccess { stat -c "%Y" "/root/.monit.state"; }
export -f getStateAccess
export STATE_ACCESS=$(getStateAccess)
function checkHasReloaded { test "$(getStateAccess)" != "${STATE_ACCESS}"; }
export -f checkHasReloaded

monit reload

timeout --signal=9 5 bash -c "while ! (checkHasReloaded); do sleep 0.05; done"
{% endhighlight %}

### Why reloading monit?

Our monit daemons are configured to alert us whenever a service doesn't respond, dies, restarts etc.
During **maintenance** we want to disable that alerting. For example we don't want to receive emails every time we restart our web server
during the application deployment.

To achieve that we change monit's configuration and then apply it by reloading monit.
A [`monit-alert` script](https://github.com/cargomedia/puppet-packages/blob/master/modules/monit/templates/bin/monit-alert.sh) allows us to something à la:

```
monit-alert none
/etc/init.d/nginx stop
deploy-my-app
/etc/init.d/nginx start
monit-alert default
```
