# CORS Demystified
## It's Simpler Than You Think

This repository contains the slide deck and demos used in my conference talk on Cross-Origin Resource Sharing.

### Abstract

CORS stands for Cross-Origin Resource Sharing. But what does that really mean? In short, any time a client-side application running on one site requests a resource (image, script, json file, etc) from another site, that request is cross-origin.

As web applications become more complex, a growing percentage of traffic between sites stems from one CORS request or another. Almost any developer working today has dealt with CORS at some point, or will in the future. In many cases, CORS &quot;just works&quot; without any thought from the developer. But in more complex cases, it's easy to fall into the trap of copying a server config or chunk of JavaScript without truly understanding the interaction between the client and server.

This session is intended to help developers understand exactly what CORS is and how it works. We'll talk about some reasons that CORS is a crucial part of the modern web, what it enables, and some things that it can't do. Ultimately, we want to pull back the curtain and reveal the truth behind CORS. It is a simple, powerful tool that helps developers build better and more robust applications.

### Running Locally

Both the slide deck and the demos run locally via Node.js. Follow these steps to run the presentation locally.

1. Download the version of the talk you wish to view from the [releases page](https://github.com/chimericdream/cors-demystified/releases) and extract it to a folder on your computer.
1. From a command prompt, run `npm install && bower install`.
1. Run `npm run start` to run the `server.js` file.

The presentation will be available at [http://localhost:8000](http://localhost:8000), and the demos will be at [http://localhost:3000](http://localhost:3000).

## Copyright & License

The contents of this talk, as well as the images and diagrams within, are Copyright 2017 Bill Parrott, unless otherwise specified.

All original content in this repository (slides, images, demos, etc) is released under the MIT License. See the [LICENSE](https://github.com/chimericdream/cors-demystified/blob/master/LICENSE) file for the full text of the license.
