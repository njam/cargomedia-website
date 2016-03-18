---
layout: post
title:  "Benchmarking WebSocket Servers"
date:   2012-11-05 21:16:06
owner: Reto
tags: [WebSockets, node.js, Sock.js, Socket.IO, benchmark]
---

We're using WebSocket connections to provide real-time information to the users of our PHP web application. A year ago we implemented a solution based on the WebSocket-emulation layer Socket.IO. Due to some issues we switched to
SockJS few months ago. For both we’ve set up a small server in Node.js which relays the push messages from our PHP application to the WebSocket-emulation, which then pushes them to the browser:

![SocketRedis](/img/posts/2012/socket-redis-1.png)

<!--more-->

The above drawing shows the flow of real-time information coming from an XHR-request from a browser, ending in a WebSocket message sent to one (or multiple) browsers. For queueing and relaying messages between PHP and Node.js we use Redis pub/sub (the
code is on github).

It would be nice if we could do all this with just PHP. This seems to be possible with
Ratchet, which uses the “stream_select()“-functionality to provide a WebSocket server. But how fast is this?

## Simulating WebSocket clients

To estimate how a WebSocket server with Ratchet would perform, let’s create a simple benchmarking script:
websocket-benchmark is a Node.js-script which opens connections to a WebSocket server, sends some messages to it, closes the connection and in the end shows the average elapsed time.

The following command will create 1000 WebSocket clients (running 10 concurrently) which will each send 5 messages to “echo.websocket.org”:

```bash
$ ./bin/websocket-benchmark.js -h ‘ws://echo.websocket.org/’ -n 1000 -c 10 -r 5

Starting 1000 clients doing 5 roundtrips to ‘ws://echo.websocket.org/’.
Min: 806ms
Mean: 884.8ms
Max: 1967ms
```

### SockJS

So let’s start an
echo server with SockJS
 in a local virtual machine running Debian squeeze. Five WebSocket-roundtrips take 34 ms, the bottleneck is the CPU:

```bash
$ ./bin/websocket-benchmark.js -h ‘ws://10.10.10.10/echo/websocket’ -n 1000 -c 10 -r 5

Starting 1000 clients doing 5 roundtrips to ‘ws://10.10.10.10/echo/websocket’.
Min: 24ms
Mean: 33.89ms
Max: 76ms
```

### Ratchet

Now that we have some reference timings, let’s set up an
echo server with Ratchet
. Again the CPU is limiting, but the server seems to respond fast:

```bash
$ ./bin/websocket-benchmark.js -h ‘ws://10.10.10.10′ -n 1000 -c 10 -r 5

Starting 1000 clients doing 5 roundtrips to ‘ws://10.10.10.10′.
Min: 28ms
Mean: 46.461ms
Max: 84ms
```

Now let’s update PHP from 5.3 to 5.4 as

suggested by @igorwesome:

```bash
$ ./bin/websocket-benchmark.js -h ‘ws://10.10.10.10′ -n 1000 -c 10 -r 5

Starting 1000 clients doing 5 roundtrips to ‘ws://10.10.10.10′.
Min: 20ms
Mean: 33.945ms
Max: 57ms
```

..let’s also install the “libevent” wrapper for PHP, so Ratchet can use that instead of “stream_select()”:

```bash
$ apt-get install libevent-dev
$ pecl install channel://pecl.php.net/libevent-0.0.5
$ ./bin/websocket-benchmark.js -h ‘ws://10.10.10.10′ -n 1000 -c 10 -r 5

Starting 1000 clients doing 5 roundtrips to ‘ws://10.10.10.10′.
Min: 18ms
Mean: 35.715ms
Max: 66ms
```

So the libevent seems not to help in my case.

### Conclusion

These basic benchmarks show that Ratchet should perform similar to a SockJS/Node.js-based solution. Still they don’t cover everything that’s of interest when using it in production.

The next step for us will be to test it on real traffic. Does anyone have experience with that?

### Notes

The conducted benchmark is very simple, I only measured roundtrip-delay implicitly, and concurrency was quite low. Still it should give a rough estimate.
Since not all browsers implement WebSocket support, Ratchet and SockJS can fall back to different other “transports” (Longpolling, Flash socket, etc.). Depending on how many IE-users you have, these fall backs can be more important than actual WebSocket connections.
