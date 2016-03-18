---
layout: post
title: "Fighting Scam with Tesseract OCR"
date: 2015-03-04 17:00:00
owner: Sébastien
tags: [tesseract,ocr,svm,spam,scam]
---

Machine learning algorithms like [SVM](http://en.wikipedia.org/wiki/Support_vector_machine) are great to tell apart legit messages from spam or scam.
But what can you do if scammers are using images instead of plain text to bypass this system?
Fortunately, there are a few open source [OCR](http://en.wikipedia.org/wiki/Optical_character_recognition) tools that you can use to read the text from an image.
We've tested [Tesseract OCR](http://en.wikipedia.org/wiki/Tesseract_%28software%29), with impressive results.

<!--more-->

### Installing Tesseract OCR

Tesseract OCR is one of the most accurate open-source tools to grab text from an image.
Created in 1985, this command line utility is still under active development, with a Google sponsorship going on since 2006.
Installing it is a breeze on Mac OS with [Homebrew](http://brew.sh/):

```bash
brew install tesseract
```

or as a Debian package with:

```bash
sudo apt-get install tesseract-ocr
```

### Basic Usage

In a matter of milliseconds, Tesseract can scan any image and output its text content to a file:

```bash
tesseract image.jpg image
cat image.txt
```

Blocks of text at different places on the image will be rendered in the natural reading order, even for complex layouts.

In most cases, the text will already be recognized quite well with this simple method.
But if the text is too small, or if the background is too noisy, the results will be very disappointing.
Fortunately, preprocessing the image to make it fit Tesseract's requirements is easy with image processing tools like [ImageMagick](http://www.imagemagick.org/).

### Scaling up with ImageMagick

Typically, the height of the “x” character should be at least of 20 pixel in order for Tesseract to recognize it properly.
If there is small text on the image, scaling up by a factor 4 improves a lot the quality of the results.

This can be done on the command line with ImageMagick. Installing it on Mac OS is as simple as:

```bash
brew install imagemagick
```

We are going to use the “convert” utility to scale up the image before scanning it with Tesseract:

```bash
convert image.jpg -resize 400% image-resized.jpg
tesseract image-resized.jpg image-resized
cat image-resized.txt
```

In most cases, the text of a “clean” image will be grabbed perfectly now.
Unfortunately, scammers often use crappy, low-quality images with lots of noise and a poor contrast.
Handling that will require further work and some fine-tuning, but it's definitely worth the effort.

### Image Preprocessing

Basically, there is a unique rule to follow when you preprocess images before sending them to an OCR system: Simplify, simplify, simplify!
Tesseract uses a two-pass approach to scan the text:
It identifies first characters with a clear shape, and then it does more of a guess work to get the missing characters in words.
The image preprocessing step is aimed at highlighting the relevant shapes and removing the noise to prepare the ground for Tesseract.

ImageMagick's “convert” utility has all the features we need to do that.
The “enhance” option removes most of the noise,
“contrast-stretch” uses the full luminosity range to enhance the contrast in each channel,
and “posterize” is a straight-forward way to simplify the shapes by reducing the number of colors in the palette.

In real conditions, with blurry or noisy images, low contrast and small text, you can still reach an impressive accuracy with the following preprocessing:

```bash
convert image.jpg -enhance -contrast-stretch 0 -posterize 8 -resize 400% -posterize 8 image-preprocessed.jpg
tesseract image-preprocessed.jpg image-preprocessed
cat image-preprocessed.txt
```

### Scam Fighting

We've tested it with the following image, sent by an account verification scammer:

![Verification Scam](/img/posts/2015/scam.jpg)

Even with this noisy background behind the text, the output is almost perfect:

```bash
WARNING!!!

WE ARE GOING TO DELETE YOUR ACCOUNT NOW, FOR
FAILURE TO COMPLY WITH OUR VERIFICATION PROCESS. BUT WE

ARE GIVING YOU ANOTHER 5 MINUTES TO COMPLY. THIS WILL BE
THE VERY IAST WARNING. IF THIS WARNING IS TO BE IGNORED
AGAIN. WE WILL BE FORCED TO DELETE YOUR ACCOUNT AND MARK

YOU AS SPAM.
```

This is something we can use directly to feed our text-based spam detection system.
We're looking forward to integrating this solution directly into our messaging system to fight scam more effectively than ever!

Have you already used Tesseract or another OCR system to scan user content?
We'd love to hear about your experiences!
