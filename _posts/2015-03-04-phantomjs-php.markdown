---
layout: post
title: "Acceptance Tests with PhantomJS and PHP"
date: 2015-03-04 17:00:00
owner: Reto, Marian
tags: [testing,phantomjs,php]
---

[Last month](/2015/02/04/headless-browser-testing.html) we investigated how to use headless browsers in NodeJS for running automated tests.
For better integration with our workflows we now look into using *PhantomJS* with PHP to run acceptance tests.

<!--more-->

We're again testing some basic user flows for the web application [denkmal.org](https://github.com/denkmal/denkmal.org/).
Clicking a link leading to another page. Filling in a form and submitting it.

Both examined solutions use a WebDriver client to connect to a PhantomJS' WebDriver server which eventually runs your webpage. To install PhantomJS:

```
brew install phantomjs192
```

Then start a PhantomJS WebDriver server:

```
phantomjs --webdriver=4444
```

### Facebook's [php-webdriver](https://github.com/facebook/php-webdriver)
*php-webdriver* is a complete set of bindings for *WebDriver* written in PHP.
Its API looks almost the same as the WebDriver client for Java etc. So anyone with experience there will have no trouble starting off.

We'll be using *php-webdriver* in combination with *PHPUnit* to create an actual test case.

#### Installation:
```
composer require --dev facebook/webdriver
composer require --dev phpunit/phpunit
```

#### Test case:
```php
<?php

class MyTest extends CMTest_TestCase {

    /** @var \RemoteWebDriver */
    protected $_driver;

    protected function setUp() {
        $capabilities = new \DesiredCapabilities([\WebDriverCapabilityType::BROWSER_NAME => 'phantomjs']);
        $this->_driver = \RemoteWebDriver::create('http://localhost:4444/wd/hub', $capabilities);
    }

    protected function tearDown() {
        $this->_driver->close();
    }

    public function testAddPage() {
        $this->_driver->get('http://www.denkmal.dev/');

        $this->_driver->findElement(WebDriverBy::cssSelector('a.addButton'))->click();
        $this->_driver->wait()->until(WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::cssSelector('.Denkmal_Page_Add')));

        $this->stringContains('Event hinzufügen', $this->_driver->findElement(WebDriverBy::cssSelector('h1'))->getText());
        $this->stringContains('/add', $this->_driver->getCurrentURL());

        $this->_driver->takeScreenshot(DIR_ROOT . '/screenshot.png');
    }

    public function testNewEvent() {
        $this->_driver->get('http://www.denkmal.dev/add');

        $this->_driver->findElement(WebDriverBy::cssSelector('#s2id_autogen2'))->sendKeys('My venue' . time());
        $this->_driver->wait()->until(WebDriverExpectedCondition::visibilityOfElementLocated(WebDriverBy::cssSelector('.select2-highlighted')));
        $this->_driver->findElement(WebDriverBy::cssSelector('.select2-highlighted'))->click();
        $this->_driver->wait()->until(WebDriverExpectedCondition::visibilityOfElementLocated(WebDriverBy::cssSelector('[name="venueAddress"]')));

        $this->_driver->findElement(WebDriverBy::cssSelector('[name="venueAddress"]'))->sendKeys('My Address 1');
        $this->_driver->findElement(WebDriverBy::cssSelector('[name="venueUrl"]'))->sendKeys('http://www.example.com/');
        (new \WebDriverSelect($this->_driver->findElement(WebDriverBy::cssSelector('[name="date[year]"]'))))->selectByValue('2015');
        (new \WebDriverSelect($this->_driver->findElement(WebDriverBy::cssSelector('[name="date[month]"]'))))->selectByValue('3');
        (new \WebDriverSelect($this->_driver->findElement(WebDriverBy::cssSelector('[name="date[day]"]'))))->selectByValue('4');
        $this->_driver->findElement(WebDriverBy::cssSelector('[name="fromTime"]'))->clear()->sendKeys('20:30');
        $this->_driver->findElement(WebDriverBy::cssSelector('[name="title"]'))->sendKeys('My Title');

        $this->_driver->wait()->until(WebDriverExpectedCondition::visibilityOfElementLocated(WebDriverBy::cssSelector('.Denkmal_Component_EventPreview')));

        $this->stringContains('My Venue', $this->_driver->findElement(WebDriverBy::cssSelector('.Denkmal_Component_EventPreview .event-location'))->getText());
        $this->stringContains('My Title', $this->_driver->findElement(WebDriverBy::cssSelector('.Denkmal_Component_EventPreview .event-details'))->getText());
        $this->stringContains('21:30', $this->_driver->findElement(WebDriverBy::cssSelector('.Denkmal_Component_EventPreview .time'))->getText());

        $this->_driver->findElement(WebDriverBy::cssSelector('.Denkmal_Form_EventAdd'))->submit();
        $this->_driver->findElement(WebDriverBy::cssSelector('button[type="submit"]'))->click();
        $this->_driver->wait()->until(function (RemoteWebDriver $driver) {
            return $driver->executeScript('return !$.active;');
        });
        usleep(0.5 * 1000000);

        $this->assertTrue($this->_driver->findElement(WebDriverBy::cssSelector('.formSuccess'))->isDisplayed());
        $this->assertFalse($this->_driver->findElement(WebDriverBy::cssSelector('.Denkmal_Form_EventAdd .preview'))->isDisplayed());
        $this->assertFalse($this->_driver->findElement(WebDriverBy::cssSelector('.Denkmal_Form_EventAdd .formWrapper'))->isDisplayed());
    }
}
```

See the [full change here](https://github.com/njam/denkmal.org/commit/8ecfb435760caec78fa6e4793235f07c86e1cdd2).

#### Run test case:
```
bin/phpunit MyTest.php
```

### [Codeception](http://codeception.com/)
*Codeception* is a full-blown testing framework for PHP. It supports all popular PHP frameworks, allows all kinds of test styles (unit, functional, acceptance).

Under the hood *Codeception* can also use *php-webdriver* to run acceptance tests.

#### Installation:
```
composer require --dev codeception/codeception
bin/codeception bootstrap
```

#### Test case:
```php
<?php

class MyTest extends \Codeception\TestCase\Test {

    /** @var AcceptanceTester */
    protected $tester;

    protected function _before() {
    }

    public function testAddPage() {
        $this->tester->wantTo('Can navigate to "add" page');
        $this->tester->amOnPage('/');

        $this->tester->click('Event hinzufügen');
        $this->tester->waitForElement('.Denkmal_Page_Add', 1);
        $this->tester->see('Event hinzufügen', 'h1');
        $this->tester->seeInCurrentUrl('add');
    }

    public function testNewEvent() {
        $this->tester->wantTo('Can submit a new event');
        $this->tester->amOnPage('/add');

        $this->tester->fillField('#s2id_autogen2', 'My venue');
        $this->tester->waitForElement('.select2-highlighted', 1);
        $this->tester->click('.select2-highlighted');
        $this->tester->waitForElement('[name="venueAddress"]', 1);
        $this->tester->fillField('venueAddress', 'My Address 1');
        $this->tester->fillField('venueUrl', 'http://www.example.com/');
        $this->tester->selectOption('date[year]', '2015');
        $this->tester->selectOption('date[month]', '3');
        $this->tester->selectOption('date[day]', '4');
        $this->tester->fillField('fromTime', '20:30');
        $this->tester->fillField('title', 'My Title');

        $this->tester->click('Hinzufügen');
        $this->tester->dontSee('Der Event wurde hinzugefügt');
        $this->tester->waitForJS('return !$.active;', 1);
        $this->tester->see('Der Event wurde hinzugefügt');
    }
}
```

See the [full change here](https://github.com/njam/denkmal.org/commit/9a89706048f2d669bffd537e27653c79ada3b08e).

#### Run test case:
```
bin/codecept run
```

### Summary
*php-webdriver*'s API is very verbose. It doesn't use PHP namespaces, so all class names are long.

On the other hand *Codeception* has a very concise way of describing user interaction with a web site. *But* its code base felt very inflated.
It generates code in your project, adds all kinds of configuration files, uses `__call()` a lot and uses its own CLI runner - in short: TMM (Too Much Magic).

A solution in between would be great! A simple PHPUnit compatible library to simplify the most important calls to *php-webdriver*.
