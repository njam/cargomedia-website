---
layout: post
title: "Test node process.exit with mochajs"
date: 2015-02-24 12:30:00
owner: vogdb
tags: [node,mocha,process]
---

When you want to test **process.exit** in node, the problem comes that such action will shutdown your tests and leave them unfinished. To solve this issue, you need to fork the execution of your test. The following short snippet of code will show how to run each test in its own process with mochajs.

<!--more-->

add the next **test** script line to **scripts** in **package.json**:

```js
...
  "scripts": {
    "test": "node test/runner.js"
  },
...
```

And here is how **test/runner.js** should look like:

```js
var cp = require('child_process');
var join = require('path').join;
var walk = require('walk');
var mochaBin = join(__dirname, '..', 'node_modules', '.bin', 'mocha');

var walker = walk.walk(__dirname + '/spec', {followLinks: false});
walker.on('file', function(root, stat, next) {
  var filepath = root + '/' + stat.name;
  cp.spawn(mochaBin, [filepath], {stdio: 'inherit'});

  next();
});
```
