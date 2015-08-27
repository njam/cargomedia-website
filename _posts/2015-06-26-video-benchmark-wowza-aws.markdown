---
layout: post
title: "Wowza powered by M3 and G2 instances on AWS"
date: 2015-06-26 22:00:00
owner: Chris
tags: [aws, gpu, transrate, transcode, wowza, nvidia, parallel computing, benchmark]
---

This blogpost is continuation of [ffmpeg/ffserver network latency benchmark](/2015/06/25/benchmark-ffmpeg-ffserver-wowza.html)

Today, I will focus on delay introduced by Wowza. As the previous blogpost showed the source of the delivery delay which is not the network latency 
but rather the computation itself I will try to explain how to reduce that waste of the time. 

#### Research

At he beginning we have to find what exactly does cause the delay. After deeper research I have found what follow:

- transcoding to multiple video/audio formats
- synchronising for KEYFRAME inserts

<!--more-->

are currently the biggest issues in my opinion. Each stream can be transcoded into multiple formats in parallel but there is a need for 
synchronisation on some point which make the whole process very complex. Synchronisation is done mainly by KEYFRAMEs for better support 
of e.g. [SMIL](https://en.wikipedia.org/wiki/Synchronized_Multimedia_Integration_Language) (Synchronised Multimedia Integration Language) which 
allows you to switch streams more fluently on the player side.

Even if the lower resolution streams are transformed very fast, there are `HD`, `FullHD` streams which introduce high **delay**. 
So the question is for the lowest limit of that delay? I will compare computation on AWS instances of type **M3** and 
**G2**. The difference is basically in [GPU](https://en.wikipedia.org/wiki/Graphics_processing_unit) (Graphic Processing Unit) which 
is dedicated hardware for extremely fast processing in parallel. This days it is used commonly in many areas of game, medical and science industry. 
Fortunately, there is a possibility to launch such instances on AWS!

#### Workflow

My benchmark depends and is achieved by adding timestamps to the video frames on the delivery way between publisher and subscriber. 
There are checkpoints for marking publish-time, play-time and computation marker for time compensation used during the stream processing.

![Wowza Benchmark Workflow](/img/posts/2015/wowza-benchmark-workflow.png)

<strong>Wowza on m3.2xlarge/aws</strong>

No transcoder, origin stream

![Wowza Benchmark Frame](/img/posts/2015/wowza-benchmark-frame-no-trans.png)

<h4 style="text-align: center;"><strong>58.88-56.37-(56.37-55.22)-(58.88-57.83) = 310ms</strong></h4>

With transcoder, origin stream

![Wowza Benchmark Frame](/img/posts/2015/wowza-benchmark-frame-origin-trans.png)

<h4 style="text-align: center;">40.69-37.93-(40.69-39.84)-(37.93-36.73)= 710ms</h4>

With transcoder, passthrough mode

![Wowza Benchmark Frame](/img/posts/2015/wowza-benchmark-frame-transcoded.png)

<h4 style="text-align: center;">39.87-35.31-(39.87-38.92)-(35.31-34.15)= 2100ms = 2.1s</h4>

Basically adding more and more complexity we slow down the whole workflow (presented timing could be improved by default for wowza; I want to show 
the problem itself). This behaviour is pretty obvious but how could we prevent that?

This is why I did the next test using GPU, powered by AWS G2 instance. <span style="font-size: 18px;">Please check for the next blogpost where 
I will share some G2 data and steps you could run your own instances...</span>

You can find some useful publisher and subscriber ffmpeg CLI tips [here](/2015/06/25/benchmark-ffmpeg-ffserver-wowza.html)

##### (this blogpost is crossposting of [kris-lab blog](http://blog.kris-lab.com/wowza-powered-by-m3-and-g2-instances-on-aws/))
