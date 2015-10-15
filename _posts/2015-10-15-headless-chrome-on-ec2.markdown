---
layout: post
title: "Headless Chrome on EC2"
date: 2015-10-15 18:00:00
owner: Reto, Chris
tags: [ec2, stress testing, chrome]
---

To stress test a WebRTC application we had the need to run **100 Chrome browsers** with high network throughput and CPU power.
The following shows you how to install and launch Chromium on Ubuntu with a virtual X server.

<!--more-->

#### Launch EC2 instances

Install AWS' EC2 command line tools if you don't have them:
{% highlight bash %}
brew install ec2-api-tools
{% endhighlight %}

Launch an instance (or a few of them):
{% highlight bash %}
ec2-run-instances ami-b3fbccc4 -t c4.8xlarge --region eu-west-1 -O <ACCESS-KEY> -W <SECRET-KEY> --key <KEYPAIR-NAME>
{% endhighlight %}
Check the [Ubuntu 15.04 release page](http://cloud-images.ubuntu.com/releases/15.04/release/) for available AMIs.
The instance type "c4.8xlarge" (compute optimized) can run about 100 Chromium instances in parallel.

#### Run Chromium with xvfb

Install Chromium and the X virtual framebuffer xvfb:
{% highlight bash %}
sudo apt-get install -y chromium-browser xvfb
{% endhighlight %}

Start Chromium with a startup URL and put it in the background:
{% highlight bash %}
xvfb-run -a --server-args='-screen 0, 1024x768x16' chromium-browser "--user-data-dir=/tmp/chrome$(date +%s%N)" --disable-gpu --start-maximized 'http://example.com' > /dev/null &
{% endhighlight %}
Explaining the command:

- `xvfb-run -a` Run a command with *xvfb*, automatically detecting a free server number.
- `chromium-browser --user-data-dir` Use a temporary data directory, to avoid Chromium to reuse existing processes when opening a new URL.
- `--start-maximized 'http://example.com'` Start Chromium maximized and open the given website.
- `> /dev/null &` Ignore any output from Chromium and put the process into the background.


Just run the command a few times to spawn multiple browsers!
{% highlight bash %}
for i in $(seq 1 10); do [...] done
{% endhighlight %}
