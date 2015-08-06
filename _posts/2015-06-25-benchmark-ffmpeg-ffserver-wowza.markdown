---
layout: post
title: "Video streaming benchmark with ffmpeg, ffserver, wowza"
date: 2015-06-25 19:10:00
owner: Chris
tags: [ffmpeg, ffserver, wowza, video, streaming, terraform, AWS, benchmark]
---

I had a chance for deep research and test of video/audio streaming techniques. My testing stack is based on Wowza which worked good enough for 
simple solutions. I have decided to extend that model so there was a need to research much deeper for techniques and find out 
the cutting-edge technology of this days...

<!--more-->

I started with as basic as possible tooling. Ffmpeg, ffserver, ffplay combined with NTP (Network Time Protocol) is actually a very powerful toolset. 
I decided to go with AWS using 2 regions: North Virginia (US) for server instance and Ireland (EU) for clients.

#### The workflow looks like follows

![Video Streaming Workflow](/img/posts/2015/video-streaming-workflow.png)

The test is basically about transatlantic streaming of video via `ffmpeg/ffserver` pipes which add the timestamps on the way. 
It helps for pretty accurate calculation of network latency which is introduced on each stage. Some of timestamp are introduced for 
calculating the computation offset and to compensate this delay in final result.

#### Sample of network latency estimation

![Streaming Latency Sample](/img/posts/2015/sample-streaming-latency.png)

The calculations (using last 5 digits XXX.XX)
T1 = 697.96
T2 = 698.86
T3 = 700.18

&nbsp;
<h4 style="text-align: center;"><strong>Point_To_Point_Time = T3-T2 - (T2-T1) = 420ms</strong></h4>
&nbsp;

The best result I could currently achieve was <strong>200ms</strong>. This is pretty good achievement, considering transatlantic delay which is ~75ms and the cloud computation delay...

#### Publisher command

{% highlight bash %}
ffmpeg -i your-file.mp4 -tune zerolatency -filter:v "setpts=1.0*PTS" -f nut pipe:1 \
| ffmpeg -re -i pipe:0 -vf "drawtext=expansion=normal:fontfile=/usr/share/fonts/truetype/ttf-dejavu/DejaVuSans.ttf:reload=1:textfile=test.txt: x=50: y=50: fontcolor=white" -tune zerolatency -f nut pipe:1 \
| ffmpeg -y -i pipe:0 -tune zerolatency http://ffserver-ip:7000/feed1.ffm
{% endhighlight %}

#### Subscriber command

{% highlight bash %}
ffmpeg -rtsp_transport tcp -i rtsp://ffserver-ip:8544/live.mp4  -tune zerolatency -vf "drawtext=expansion=normal:fontfile=/usr/share/fonts/truetype/ttf-dejavu/DejaVuSans.ttf:reload=1:textfile=test.txt: x=50: y=70: fontcolor=white" output.mp4
{% endhighlight %}

#### Server 

The server configuration you can find [here](https://gist.github.com/kris-lab/28060a51c122b4da08b9)

The *Timestamp* which is drawn on the each frame is read from file test.txt. This file is updated by external python process using script which 
you can find [here](https://gist.github.com/kris-lab/28060a51c122b4da08b9) as well.

I deployed the infrastructure using [Terraform](http://www.terraform.io/) but obviously this is not the important part. You can use any deployment tool or even do it manually.

### Wowza approach (draft)

![Wowza Architecture Draft](/img/posts/2015/wowza-architecture-draft.png)

This is draft of upcoming test. Will elaborate in next blogposts...

##### (this blogpost is crossposting of [kris-lab blog](http://blog.kris-lab.com/video-streaming-benchmark-with-ffmpeg-ffserver-wowza/))
