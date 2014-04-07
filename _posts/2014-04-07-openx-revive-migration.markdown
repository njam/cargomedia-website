---
layout: post
title: "Reducing OpenX to Revive AdsServer migration pain!"
date: 2014-04-07
owner: Chris
tags: [openx, revive]
---

A few weeks ago our team decided to migrate **OpenX 2.8.3** run on **Debian Squeeze** to **Revive AdsServer 3.0.3** run on **Debian Wheezy**.
We researched a lot and gathered as much info as possible. All preparation took a bit as platform was tested using specs
which are part of open source [puppet-packages](https://github.com/cargomedia/puppet-packages) deployment modules (done by [us](https://github.com/cargomedia/))

The upgrade process is described very well on [Revive website](http://www.revive-adserver.com/support/upgrading/). They suggest to read manual very carefully!
I confirm, please do it and please read very carefully also [requirements](http://www.revive-adserver.com/support/requirements/).

### Steps

- migration to Debian Wheezy using default package sources
- [puppet-packages/revive](https://github.com/cargomedia/puppet-packages/tree/master/modules/revive) module has been prepared
- backup has been done (db, files)
- upgrade done like in [manual](http://www.revive-adserver.com/support/upgrading/) prepared by Revive team. **Unfortunately I experienced some problem during plugins installation and permission mismatch of previous installation folder but finally
upgrade wizard confirmed that all finished successfully. Also maintenance tools confirmed that all works good!**
- to make sure all is fine the plugins have been reinstalled using [github master branch](https://github.com/revive-adserver/revive-adserver/tree/master/plugins_repo/release)


I have to mention here that I had no too much experience as user of OpenX. I could confirm that UI works fine,
maintenance test passed, all data exists, ads are delivered to end point.

### 2 weeks later!!!
Issue has been reported that **statistics** are not longer available. After 2 days googling, testing, tens of reinstallation
I have found many issues. Will describe some of them as maybe it will save someone time in the future.

Please notice that my server location is `/var/revive so all examples use it by default.

#### Logs viewing
```bash
$ tailf /var/revive/var/debug.log
$ tailf /var/log/php/error.log
```

On that point I have found plenty of PHP errors and no single one in revive log. All PHP errors were related to the wrong file path.
Problem was in non existing constant `RV_PATH` or `OX_PATH` (previous versions). Below how to fix it if you experience that problem.

#### Some basic errors
Because of this issue the statistics cannot be generated as no data about impression, click etc doesn’t exist.
Each HTTP Request from client to server has finished with errors!
```bash
$ nano +13 /var/revive/lib/RV.php
```
Change line
```php
require RV_PATH . '/lib/pear/PEAR.php'
```
with your server path e.g.
```php
require '/var/revive/lib/pear/PEAR.php'
```
This issue should be fixed soon by revive team in next versions…

#### Manual statistics generation
On that point there are no errors in log files. Next step is to generate statistics manually. You can do it using:
```bash
$ php /var/revive/script/maintenance/maintenance.php ads.example.com
Segmentation fault
```
Unfortunately, there is next problem. Some PHP error occurred. Please read below

#### Problem understanding
After deeper investigation using [GDB](http://www.sourceware.org/gdb/) I have found PHP segmentation problem described by
[php team](https://bugs.php.net/bug.php?id=65367) and [revive team](http://www.revive-adserver.com/blog/whats-new-in-revive-adserver-v3-0-0/).
The only solution is to update PHP but in our case the problem is that we use default sources for our Debian Wheezy (in puppet).
It installs PHP 5.4.4 by default (state for date of this post). On this point it is worth to mention that plugins problems
during upgrade (described above) are strongly related to PHP bug! As result of this issue some of mysql tables are not created (`ox_data_bkt_a` and similar)!

#### Reinstallation
We have prepared small [update](https://github.com/cargomedia/puppet-packages/pull/560) for `puppet revive module` which allows to install additional
[sources](https://github.com/cargomedia/puppet-packages/blob/master/modules/apt/manifests/source/dotdeb.pp) for apt-get package manager.

What have to be done:
- add dotdeb sources e.g. [this](https://github.com/cargomedia/puppet-packages/blob/master/modules/apt/manifests/source/dotdeb.pp)
- apt-get upgrade for example:
```bash
$ apt-get update
$ apt-get purge php5-cli
$ apt-get purge mysql-server
$ apt-get install php5-cli
$ apt-get install mysql-server
```
- revive installation (please follow revive official documentation or use [puppet-module](https://github.com/cargomedia/puppet-packages/tree/master/modules/revive))
- data migration (please follow revive official docu)

**Results**: no errors! manual statistics generation works fine. Please notice that inserts to db/table are done
every X mins what can be configured in settings/maintenance panel (by default 60min)

#### Automations
Last problem I experienced is related to statistics summarization. It was not done for me automatically.
You can find cached data about impressions, clicks etc in `/var/revive/var/cache but no data in database.
You can run time to time this
```bash
$ php /var/revive/script/maintenance/maintenance.php ads.example.com
```
or add cronjob (which makes more sense)
```bash
$ crontab -e
```
then add
```
10 * * * * /usr/bin/php /var/revive/scripts/maintenance/maintenance.php ads.example.com
```

So now all should works fine and new statistics should appear in db. For me it took up to 60-70min.

DB tables which is worth to check time to time:
- `ox_log_maintenance_statistics` contains info about maintenance activity
- `ox_data_summary_ad_hourly` contains summarized info about delivery, clicks etc. for active zones

#### Summary
Before any update please check [requirements](http://www.revive-adserver.com/support/requirements/) (it is not linked to upgrade manual)

>- Apache with mod_php or any webserver using FastCGI (nginx, IIS 7+, lighttpd, etc.)
>- PHP 5.1.4+, 5.2.x, 5.3.x, 5.4.20+, 5.5.2+
>- Required PHP extensions: zlib, pcre, xml, mysql and/or pgsql
>- Suggested PHP extensions: curl and/or openssl, gd, any opcode cache extension (opcache, apc, eaccelerator, xcache)

