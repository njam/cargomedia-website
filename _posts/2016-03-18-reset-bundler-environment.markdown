---
layout: post
title: "How Bundler changes your ENV, and how to change it back"
date: 2016-03-18 18:00:00
owner: Reto, Chris
tags: [ruby, bundler, env, komenda, spawn]
---

It's a little known fact that the Bundler (a Ruby dependency manager) changes quite a few environment variables. Like `PATH`.
This can affect your gems, for example when spawning sub processes.

<!--more-->


### How Bundler changes your ENV

Ruby binaries are often executed with *Bundler*, for conveniently managing the correct dependencies and the correct environment.
This has the side effect that all executed code is affected by the changes Bundler makes to the `ENV` object, which exposes the environment variables.

Some affected variables are internals like `BUNDLE_PATH`, but even `PATH` is touched by Bundler.
There are good reasons for that - this mechanism allows all ruby code to automatically execute in the current bundle's environment.
But quite often also it's not what is desired.

Imagine you have a very basic `PATH`:

```bash
$ echo $PATH
/usr/local/bin:/usr/bin:/bin
```

When running that same command through `bundle exec` you will instead get your bundle's binary path prepended:

```bash
$ bundle exec 'ruby -e "puts \`echo \$PATH\`"'
/usr/local/lib/ruby/gems/2.1.0/bin:/usr/local/bin:/usr/bin:/bin
```

If you spawn any binary that exists on your system as well as in a gem, you'll now get the gem's version.


### How to reset to the original environment

When spawning shell processes from Ruby gems usually you should reset the environment to not be affected by Bundler.
That can be achieved with:

```ruby
Bundler.with_clean_env do
  puts `echo $PATH`
end
```
(Note that this mechanism has some flaws in Bundler < 1.12.0 - see [#4251](https://github.com/bundler/bundler/issues/4251))


### Simpler process spawning with *Komenda*

To simplify the execution of child processes in Ruby we've created a small gem called "Komenda".
It will reset your Bundler environment by default if it detects it's running with Bundler.

```ruby
Komenda.run('echo $PATH')
```

More details on the [Komenda GitHub Page](https://github.com/cargomedia/komenda).
