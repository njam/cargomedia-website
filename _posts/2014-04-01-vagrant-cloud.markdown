---
layout: post
title: "Boxes in the Vagrant Cloud"
date: 2014-04-01
owner: Reto
tags: [vagrant,virtualization]
---

### Using Vagrant for local development
After having migrated our infrastructure configuration to puppet we finally switched to developing most of our projects in virtual machines.
Vagrant is a huge help - it allows us to define concise configuration and provisioning instructions in one file, the `Vagrantfile`.

Most of our projects now contain a `Vagrantfile` which looks like this:

{% highlight ruby %}
Vagrant.configure('2') do |config|
  config.vm.box = 'cargomedia/debian-7-amd64-cm'
  config.vm.network :private_network, ip: '10.10.10.12'
  config.vm.synced_folder '.', '/home/vagrant/denkmal', :type => 'nfs'

  config.librarian_puppet.puppetfile_dir = 'puppet'
  config.vm.provision :puppet do |puppet|
    puppet.module_path = 'puppet/modules'
    puppet.manifests_path = 'puppet/manifests'
  end

  config.vm.provision 'shell', inline: [
    'cd /home/vagrant/denkmal',
    'composer --no-interaction install --dev',
    'bin/cm app setup',
  ].join(' && ')
end
{% endhighlight %}

<!--more-->

Basically we're specifying a virtualbox image (box) to download and use,
then let the [librarian-puppet plugin](https://github.com/mhahn/vagrant-librarian-puppet) install all necessary puppet modules
and finally configure two provisioners: one to apply a puppet manifest (installing all necessary software, add an nginx vhost etc.)
and one to set up the application.
Check the [original file](https://github.com/denkmal/denkmal.org/blob/master/Vagrantfile) for additional details.

### Vagrant Cloud
In our Vagrantfiles we're not specifying any download URL for the boxes. *Vagrant Cloud* resolves the `organization/name` identifier to
a download link. This has the big advantage that one can publish new version of boxes on *Vagrant Cloud*,
and all users of that box will be able to update their local copy by running `vagrant box update`.

The Debian boxes we use for development and production are [available on *Vagrant Cloud*](https://vagrantcloud.com/cargomedia) in three flavours:

- `cargomedia/debian-7-amd64-plain`: Minimalistic Debian.
- `cargomedia/debian-7-amd64-default`: Like above, plus *git*, *rsync*, *ruby* and *puppet*.
- `cargomedia/debian-7-amd64-cm`: Like above, plus [CM framework dependencies](https://github.com/cargomedia/puppet-cm).

The code to build, test, upload and release these boxes is on Github at [cargomedia/vagrant-boxes](https://github.com/cargomedia/vagrant-boxes).

*Vagrant Cloud* has an [API](https://vagrantcloud.com/api) (closed beta currently) which allows one to CRUD boxes and their versions programmatically.
We've built a [small ruby wrapper](https://github.com/cargomedia/vagrant_cloud) for being able to release new versions automatically after they are built.

### Conclusion
Using vagrant for local development gives us a repeatable and isolated environment setup.
Additionally we can use vagrant boxes for bootstrapping production and staging machines on AWS' EC2.

Thanks to everyone involved in the Vagrant ecosystem! The toolset available is amazing and mostly *non-interactive* :)
