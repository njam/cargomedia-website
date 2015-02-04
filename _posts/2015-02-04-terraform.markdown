---
layout: post
title: "A Glimpse at Terraform"
date: 2015-02-04 19:00:00
owner: Tomasz, Reto
tags: [terraform,hashicorp,devops]
---

Our goal was to try out Hashicorp's [Terraform](https://terraform.io/), a tool that allows to "create infrastructure" based on a definition file.
For example the following definition would create three EC2 instances:

```
resource "aws_instance" "app" {
    ami = "ami-bf54d4c8"
    instance_type = "m3.large"
    count = 3
}
```

Of course we got sucked into the *Hashiuniverse* while researching, trying to understand the [*Atlas* workflow](https://atlas.hashicorp.com/help/getting-started/getting-started-overview) of managing infrastructure.

<!--more-->

![How Atlas works](/img/posts/2015/how-atlas-works.png)

We're already [building Vagrant boxes](https://github.com/cargomedia/vagrant-boxes) with Packer, using them in our development workflows, and deploying them to EC2.
With Atlas one can additionally store Packer's output *artifacts* in a cloud service. These can be AMIs, Vagrant boxes but also application directories.

Finally *Terraform* is able to read these *artifacts*, and use their meta data as input for the resources it will create.
For example an AMI's ID can be used to launch an EC2 instance:

```
resource "atlas_artifact" "app" {
    name = "cargomedia/my-ami-artifact"
    type = "aws.ami"
}

resource "aws_instance" "app" {
    ami = "${atlas_artifact.app.metadata_full.region-eu-west-1}"
    instance_type = "m3.medium"
}
```

An important idea behind this approach is to consider infrastructure resources as **immutable**.
Whenever an instance's system configuration is changed one should build a new image (with Packer), store it as an artifact (on Atlas) and finally apply it (with Terraform).
This process will destroy the previous VM and launch a new one based on a new AMI.

The same process can be used to **deploy applications**!
In fact application and image artifacts can be linked, so that whenever a new application version is pushed to Atlas (`vagrant push`), a new AMI image artifact will be built.

**These workflows don't fit our devops setup**. We have many machines with state (database-, file server, etc). Our application updates may require schema changes on database servers.
We want to avoid downtime on these systems, so we orchestrate updates of applications and system configuration with tools like [pulsar](https://github.com/nebulab/pulsar).

Fortunately Terraform (and all other programs mentioned above) has open interfaces and can be used without the full Atlas-workflow.
It might come in very handy to define infrastructure resources in code, and manage them reliably and repeatably.
If there was only a way to [import existing resources](https://github.com/hashicorp/terraform/issues/581) into Terraform...
