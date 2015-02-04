---
layout: post
title: "Headless Browser Testing"
date: 2015-02-04 13:00:00
owner: Daniel, Marian, Reto
tags: [testing,browser]
---

Test various testing frameworks and headless browsers to write automated *integration tests* of web applications.

<!--more-->

The test case we want to run for [denkmal.org](https://github.com/denkmal/denkmal.org/):

1. Open http://www.denkmal.dev/
2. Click "Add Event" in the navigation
3. Fill out form
4. Click "Submit" button
5. Expect "Thank you"

### [CasperJS](http://casperjs.org/)
Testing framework based on *PhantomJS*, written in JavaScript.
Generally feels mature, good docu, lots of resources on the Internet.

Installation:

```
brew install phantomjs192
brew install casperjs --devel
```

Test case:
{% highlight javascript %}
casper.test.begin('Can navigate to "add" page', function suite(test) {
  casper.start('http://www.denkmal.dev/');

  casper.thenClick('a.addButton', function() {
    this.waitForSelector('.Denkmal_Page_Add');
  });

  casper.then(function() {
    test.assertExists('.Denkmal_Form_EventAdd');
  });

  casper.run(function() {
    test.done();
  });
});

casper.test.begin('Can submit a new event', function suite(test) {
  casper.start('http://www.denkmal.dev/add');

  casper.then(function() {
    var dateFrom = new Date(new Date().getTime() + 86400);
    dateFrom.setHours(21, 30);

    this.fill('form.Denkmal_Form_EventAdd', {
      'venue': 'My Venue',
      'venueAddress': 'My Address 1',
      'venueUrl': 'http://www.example.com/',
      'date[year]': dateFrom.getFullYear() + 1,
      'date[month]': dateFrom.getMonth() + 1,
      'date[day]': dateFrom.getDate() + 1,
      'fromTime': dateFrom.getHours() + ':' + dateFrom.getMinutes(),
      'title': 'My Title'
    }, false);
  });

  casper.waitForSelector('.Denkmal_Component_EventPreview', function() {
    test.assertSelectorHasText('.Denkmal_Component_EventPreview .event-location', 'My Venue');
    test.assertSelectorHasText('.Denkmal_Component_EventPreview .event-details', 'My Title');
    test.assertMatch(casper.fetchText('.Denkmal_Component_EventPreview .time'), /21:30/);
  });

  casper.thenClick('button[value="Hinzufügen"]', function() {
    casper.waitFor(function() {
      return casper.evaluate(function() {
        return __utils__.visible('.formSuccess');
      });
    });
    casper.wait(500);
  });

  casper.then(function() {
    test.assertVisible('.formSuccess');
    test.assertNotVisible('.Denkmal_Form_EventAdd .preview');
    test.assertNotVisible('.Denkmal_Form_EventAdd .formWrapper');
  });

  casper.run(function() {
    test.done();
  });
});
{% endhighlight %}

Run test case:

```
casperjs test my_test.js
```
