---
layout: post
title: "phpspec drive emergent design by specification"
date: 2015-03-04 15:00:00
owner: Daniel
tags: [testing,phpspec,bdd]
---

A look into phpspec, a toolset to drive emergent design by specification.

<!--more-->

BDD, Spec BDD, phpspec are all trending topics since quite some time now. It's about time to give a look to phpspec and compare it to what we're used
to do with TDD with PHPUnit.

First of all what is Spec BDD with phpspec:

> **phpspec** is a tool which can help you write clean and working PHP code using behaviour driven development or BDD. BDD is a technique derived
from test-first development. BDD is a technique used at story level and spec level. phpspec is a tool for use at the spec level or SpecBDD.
The technique is to first use a tool like phpspec to describe the behaviour of an object you are about to write. Next you write just enough
code to meet that specification and finally you refactor this code.

And what's the difference between SpecBDD and TDD:

> **There is no real difference between SpecBDD and TDD**. The value of using an xSpec tool instead of a regular xUnit tool for TDD is the language.
The early adopters of TDD focused on behaviour and design of code. Over time the focus has shifted towards verification and structure. BDD aims to
shift the focus back by removing the language of testing. The concepts and features of the tool will keep your focus on the “right” things.

So main goal is to focus on the "right" things using a more natural language to describe behaviour of our code.

### Example

I will not go through each step of the [getting started](http://www.phpspec.net/en/latest/manual/getting-started.html) section of the official
documentation but I'll jump to the final version of the `MarkdownSpec` highlighting what phpspec wants us to like about it.

```php
<?php

namespace spec;

use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Markdown\Reader;
use Markdown\Writer;

class MarkdownSpec extends ObjectBehavior
{
    function it_is_initializable()
    {
        $this->shouldHaveType('Markdown');
    }

    function it_converts_plain_text_to_html_paragraphs()
    {
        $this->toHtml('Hi, there')->shouldReturn('<p>Hi, there</p>');
    }

    function it_converts_text_from_an_external_source(Reader $reader)
    {
        $reader->getMarkdown()->willReturn('Hi, there');

        $this->toHtmlFromReader($reader)->shouldReturn('<p>Hi, there</p>');
    }

    function it_outputs_converted_text(Writer $writer)
    {
        $writer->writeText('<p>Hi, there</p>')->shouldBeCalled();

        $this->outputHtml('Hi, there', $writer);
    }
}
```

Here something to know:

- The object behavior is made up of examples. Examples are encased in public methods, started with it_. or its_. phpspec searches for these
methods in your specification to run. Underscores are preferred to camel casing for better readability (they say).
- `$this` refers to the object under test so there's no need to instantiate an object in order to call one of its methods (phpspec does that for you).
- Running `bin/phpspec run` will ask you, if needed, if you want it to create missing classes or methods setting up a scaffolding of the project
in order to reach a red status of the tests. Red means it's time to write code to fix those tests and have a green bar.
- Objects passed to tests methods (about 3rd and 4th of `MarkdownSpec` class) are stubs/mocks of the object type passed (make sure to have a look
at [Prophecy](https://github.com/phpspec/prophecy)).
- You use matchers in phpspec to describe how an object should behave. They are like assertions in xUnit but with a focus on specifying behaviour
instead of verifying output. You use the matchers prefixed by should or shouldNot as appropriate. There are
[13 built-in matchers](http://www.phpspec.net/en/latest/cookbook/matchers.html) in phpspec.

As a long time PHPUnit user I'm probably biased when looking at new solutions, so I wanted to compare phpspec approach with classic PHPUnit approach:

```php
<?php

class MarkdownTest extends PHPUnit_Framework_TestCase
{
    public function testToHtml() {
        $this->assertEquals('<p>Hi, there</p>', (new Markdown())->toHtml('Hi, there'));
    }

    public function testToHtmlFromReader() {
        $readerStub = $this->getMockBuilder('Markdown\Reader')->getMock();
        $readerStub->method('getMarkdown')->willReturn('Hi, there');

        $this->assertEquals('<p>Hi, there</p>', (new Markdown())->toHtmlFromReader($readerStub));
    }

    public function testOutputHtml() {
        $writerMock = $this->getMockBuilder('Markdown\Writer')->getMock();
        $writerMock->expects($this->once())->method('writeText');

        (new Markdown())->outputHtml('Hi, there', $writerMock);
    }
}
```

Of course phpspec methods names are more descriptive of what the tested method actually does. On the other hand this could be kept in mind when
deciding names for class methods.

However nothing prevents us to do something like this:

```php
<?php

class MarkdownTest extends PHPUnit_Framework_TestCase
{
    public function testItConvertsPlainTextToHtmlParagraphs() {
        $this->assertEquals('<p>Hi, there</p>', (new Markdown())->toHtml('Hi, there'));
    }

    public function testItConvertsTextFromAnExternalSource() {
        $readerStub = $this->getMockBuilder('Markdown\Reader')->getMock();
        $readerStub->method('getMarkdown')->willReturn('Hi, there');

        $this->assertEquals('<p>Hi, there</p>', (new Markdown())->toHtmlFromReader($readerStub));
    }

    public function testItOutputsConvertedText() {
        $writerMock = $this->getMockBuilder('Markdown\Writer')->getMock();
        $writerMock->expects($this->once())->method('writeText');

        (new Markdown())->outputHtml('Hi, there', $writerMock);
    }
}
```

which is way more readable and would be able to output this:

```bash
$ bin/phpunit --testdox tests/MarkdownTest.php
PHPUnit 4.5.0 by Sebastian Bergmann and contributors.

Markdown
 [x] It converts plain text to html paragraphs
 [x] It converts text from an external source
 [x] It outputs converted text
```

Another variation, taking full advantage of Phrophecy support in PHPUnit 4.5, would be:

```php
<?php

class MarkdownTest extends PHPUnit_Framework_TestCase
{
    public function testItConvertsPlainTextToHtmlParagraphs() {
        $this->assertEquals('<p>Hi, there</p>', (new Markdown())->toHtml('Hi, there'));
    }

    public function testItConvertsTextFromAnExternalSourceWithProphecy() {
        $readerStub = $this->prophesize('Markdown\Reader');
        $readerStub->getMarkdown()->willReturn('Hi, there');

        $this->assertEquals('<p>Hi, there</p>', (new Markdown())->toHtmlFromReader($readerStub->reveal()));
    }

    public function testItOutputsConvertedTextWithProphecy() {
        $writerMock = $this->prophesize('Markdown\Writer');
        $writerMock->writeText('<p>Hi, there</p>')->shouldBeCalledTimes(1);

        (new Markdown())->outputHtml('Hi, there', $writerMock->reveal());
    }
}
```

Where stubs and mocks are still created manually but with a framework offering a better API.

### Summary
To summarize I'd say that phpspec has some interesting things to offer if you are conscious of all the magic it uses to help you to focus on the
"right" things. I'm not sure what could happen when you need more control over something and magic things don't let you do that.
One cool thing for sure is [Prophecy](https://github.com/phpspec/prophecy) object mocking framework now supported in
[PHPUnit since 4.5](https://phpunit.de/manual/4.5/en/test-doubles.html#test-doubles.prophecy). Worth reading more about it.
To be honest I'd not go and rewrite all tests in a project just to make them more readable, in the end we're still talking of unit testing, but if
someone feels trying it in a new project it would probably make sense.
