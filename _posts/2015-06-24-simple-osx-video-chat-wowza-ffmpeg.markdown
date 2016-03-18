---
layout: post
title: "Simple OSX bi-directional video chat using ffmpeg, ffplay and wowza"
date: 2015-06-24 11:11:00
owner: Chris
tags: [video, chat, ffmpeg, ffplay, wowza, avfundation, benchmark, low latency, streaming, live]
---

In this blogpost I will try to present how to set up a very simple video chat application for 2 users. I will call them Chris and John for simplicity.
In short, each of them will publish the video and audio. The other side will subscribe to video and audio of the publisher. For instance, Chris will
publish video/audio and John will subscribe for it. If both John and Chris will publish/subscribe we achieve "video chat" connection.

For simplicity I will describe the LAN (local network) solution. However it is fully scalable on the entire web.

<!--more-->

![Video Chat Overview](/img/posts/2015/video-chat-overview.png)

#### ffmpeg

OSX requires installation of ffmpeg. You can do it easily with [brew](http://brew.sh/).

```bash
brew install ffmpeg --with-fdk-aac --with-ffplay --with-freetype --with-frei0r --with-libass --with-libvo-aacenc --with-libvorbis --with-libvpx --with-opencore-amr --with-openjpeg --with-opus --with-rtmpdump --with-schroedinger --with-speex --with-theora --with-tools
```

#### Media server

In that example I will use [Wowza](http://www.wowza.com/) for simplicity. However in my private test I have used also `ffserver` which requires a bit more configuration and complexity.

### Wowza

Wowza Streaming Engine is much better solution than ffserver in that case. It will work almost out of the box. However it introduces more latency even in "low latency" mode.

#### Installation
To install the Wowza please use that resource of [wowza installation](http://www.wowza.com/forums/content.php?217-How-to-install-and-configure-Wowza-Streaming-Engine#startMacService)

#### Configuration
The application called "live" is created by default. For my test I did some small changes by disabling the  RTMP authentication. You can login to Wowza Streaming Engine Manager at `localhost:8088/enginemanager` by default using `root/root` as credentials. Switch to applications section to the "live" application and change the <a href="http://www.wowza.com/forums/content.php?449-How-to-enable-username-password-authentication-for-RTMP-and-RTSP-publishing" target="_blank">Incoming Security Policy</a> for "Open". Also please edit the "live" application setting and mark "low latency" mode. Then simply restart wowza using UI button and that's it! You are ready to go...

### Chat clients

Discovering of local hardware for video and audio on OSX

```bash
ffmpeg -f avfoundation -list_devices true -i ""
```

```bash
[AVFoundation input device @ 0x7f88b0422800] AVFoundation video devices:
[AVFoundation input device @ 0x7f88b0422800] [0] FaceTime HD Camera
[AVFoundation input device @ 0x7f88b0422800] [1] Capture screen 0
[AVFoundation input device @ 0x7f88b0422800] AVFoundation audio devices:
[AVFoundation input device @ 0x7f88b0422800] [0] Built-in Microphone
```

Local auto test of video/audio source and player

```bash
ffmpeg -f avfoundation -i "default":"default" -vcodec libx264 -acodec ac3 -preset ultrafast -tune zerolatency -f nut pipe:1 | ffplay pipe:0
```

> In my case there is around 0.6-0.8 second latency when piping video to the player. It happens because of shell standard input/output buffer. By default it is 16384 bytes. Documentation says it can switch to 65336 capacity if needed. However this is serious bottleneck between the source of data and the player

The screenshot below shows the camera input in the FaceTime (right side) and the same camera input piped (shell) by ffmpeg and rendered by ffplayer (left side).

![Chat Latency Test](/img/posts/2015/chat-latency-test.png)

Preparing for publishing and streaming

```bash
# IP address of computer with installed wowza server
export RTMP_SERVER=example.com:1935

# application name. by default there is "live" app created
export RTMP_APP=live

# users for video chat connection
# please switch source/destination for opposite end-points
export RTMP_STREAM_ME=chris
export RTMP_STREAM_FRIEND=john
```

Publishing video and audio as Chris/John

```bash
ffmpeg -f avfoundation -i "default":"default" -pix_fmt yuv420p -s 284x164 -vcodec libx264 -preset ultrafast -tune zerolatency -f flv rtmp://$RTMP_SERVER/$RTMP_APP/$RTMP_STREAM_ME
```

Subscribing to Chris/John's video and audio

```bash
ffplay -fflags nobuffer rtmp://$RTMP_SERVER/$RTMP_APP/$RTMP_STREAM_FRIEND
```

### Summary

This is pretty much all you have to do to start full video chat connection. The quality is not always the best due to latency problem. As we do
not implement the "echo suppression and cancellation", "noise reduction" etc on the server and the client end-point there is high chance that
you will experience bad quality connection if the network latency increases. Anyway I hope this is somehow helpful for
people starting with live video streaming...

Please ask in comments section if you need any help or more detailed explanation.

Have fun!

##### (this blogpost is crossposting of [kris-lab blog](http://blog.kris-lab.com/simple-osx-bi-directional-video-chat-using-ffmpeg-ffplay-and-wowza/))
