---
layout: tutorial
official: true
title: Building an Omegle clone in Javalin
author: <a href="https://www.linkedin.com/in/davidaase" target="_blank">David Åse</a>
github: https://github.com/tipsy/omeglin
date: 2023-12-30
permalink: /tutorials/building-an-omegle-clone-in-javalin
summarytitle: Building an Omegle clone in Javalin
summary:
  In this tutorial we will build a simple WebRTC video conference application in Javalin. 
  The application will be similar to Omegle, where you are paired with a random stranger and can chat with them.
language: ["java", "kotlin"]
---

## Introduction
In this tutorial, we will build a simple and fully functional Omegle clone using Javalin. 
Our application will facilitate random pairing of users for video chat, and will look
a lot like the real Omegle platform ([rest in peace](https://www.omegle.com/)). 
For the frontend, we will be using plain
JavaScript and WebRTC, no frameworks or libraries. Despite this, the full 
JavaScript frontend will just be a bit over two hundred lines of code.
The backend will be 80-120 lines, depending on whether you're following the 
Kotlin or Java version of the tutorial.

Our application will look like this:
<div markdown="1" class="rounded-screenshot">
![Omeglin](/img/omeglin.png)
<style>.rounded-screenshot img{border-radius:8px;box-shadow: 0 5px 25px rgba(0,0,80,0.35)}</style>
</div>

## Setting up the project
You can use [Maven](https://javalin.io/tutorials/maven-setup) or 
[Gradle](https://javalin.io/tutorials/gradle-setup) 
(or even [Bazel](https://javalin.io/tutorials/bazel)) to set up your project.
Please follow the respective guide for your build tool of choice. As for dependencies,
we will just be using the Javalin bundle, which includes Javalin, Jetty, Jackson, and Logback.

Please add the following dependencies to your build file:

```xml
<dependency>
    <groupId>io.javalin</groupId>
    <artifactId>javalin-bundle</artifactId>
    <version>{{site.javalinSixVersion}}</version>
</dependency>
```

### Project structure
We will be using the following project structure:

<div markdown="1" class="compressed-pre">
```java
src
├── main
│   ├── java/kotlin
│   │   └── io
│   │       └── javalin
│   │           └── omeglin
│   │               ├── OmeglinMain.kt/java // main class
│   │               └── Matchmaker.kt/java  // matchmaking logic
└── resources
    └── public
        ├── index.html                      // html for the frontend
        ├── js
        │   ├── app.js                      // main class
        │   ├── peer-connection.js          // webrtc logic
        │   └── chat.js                     // chat logic
        └── style.css                       // styling
```
</div>
<style>.compressed-pre pre code{line-height:1.28}</style>

## Implementing the backend
The backend will be very simple. We will need a static file handler for the frontend, a websocket handler
for the WebRTC signaling. Let's have a look at the main class:

{% include macros/importingDocsSnippet.html 
    java="snippets/main/java/io/javalin/omeglin/OmeglinMain.java"
    kotlin="snippets/main/kotlin/io/javalin/omeglin/OmeglinMain.kt" %}

We add the static files using `Loation.EXTERNAL`, so that we can make changes to the frontend without
restarting the server. We also add a websocket handler, which will be used for the WebRTC signaling.
Finally, we start the server on port 7070. All of the backend logic will be in the matchmaking class.
Before showing the full code, let's discuss the individual classes and methods that make up 
the matchmaking logic.

### Matchmaker
This class handles the WebSocket connections for the application.
It maintains a queue of `Exchange` objects, where each `Exchange`
represents a pair of users wanting to perform an SDP (Session Description Protocol) exchange.\\
When the exchange is finished, the `Exchange` object is removed 
from the queue and all subsequent messages are sent directly between the users (peer-to-peer).\\
Video and audio streams are sent directly between the users, never through the server.

The `websocket` method sets up all the WebSocket event handlers:
- `onConnect`: When a user connects, automatic pings are enabled to keep the connection alive.
- `onClose`: When a user disconnects, `pairingAbort` is called to remove the
  user from the pairing queue (if they are in it).
- `onMessage`: When a message is received, it's processed based on its type.
  There are several types of messages that can be received, such as "PAIRING_START", "PAIRING_ABORT",
  "PAIRING_DONE", and various SDP messages related to establishing the WebRTC connection. 
  These SDP messages are simply sent to the other user in the pair, not processed by the server.

### Exchange
This class holds the two users (`WsContext`) required to perform the SDP Exchange for pairing,
as well as a `doneCount` to track if both users have finished pairing up (for cleanup purposes).
It has an `otherUser` method which returns the other user in the pair given one user, 
which is useful for passing messages between the users.

### Message
This class represents a message that can be sent over the WebSocket connection.
It contains a `name` for the type of the message and optional `data` for any additional information.

### The full matchmaking code
{% include macros/importingDocsSnippet.html 
    java="snippets/main/java/io/javalin/omeglin/Matchmaking.java"
    kotlin="snippets/main/kotlin/io/javalin/omeglin/Matchmaker.kt" %}

Now that we have the backend logic in place, let's move on to the frontend.

## Implementing the frontend
We'll try to keep the frontend as simple as possible. We will use plain JavaScript and WebRTC (and some CSS),
no frameworks or libraries. The frontend will be split into five files:
* `index.html`: The HTML for the page (this defines the UI elements: videos, buttons, chat-log, etc)
* `style.css`: The CSS for the page (this defines how everything looks).
* `app.js`: The main JavaScript file (similar to the main class in the backend)
* `peer-connection.js`: The WebRTC logic (sets up the peer connection and handles the SDP exchange)
* `chat.js`: The chat logic (handles the chat user input and UI updates related to chat)

### Index.html
There is nothing special about the HTML for this project, the main elements to note are:
* the `video` elements for the local and remote video streams.
* the `button` elements for finding a new partner, aborting the search, and ending the call.
* the input/output for the chat messages.

The classes on the elements are used for styling (defined in styles.css),
and the IDs are used for attaching event listeners (defined in javascript files).

The `app.js` file is included as a module, so that we can use the JavaScript 
`import` syntax to import the other JavaScript files (native javascript modules).

```html
{% include_relative snippets/main/resources/public/index.html %}
```

### App.js
The `app.js` file is the main JavaScript file, similar to the main class in the backend.
It's responsible for initializing everything and setting up event listeners for `peer-connection.js`,
as well as events listeners for the UI elements (except for the chat functionality, which is handled by `chat.js`).

```javascript
{% include_relative snippets/main/resources/public/js/app.js %}
```

Thanks to [hoisting](https://developer.mozilla.org/en-US/docs/Glossary/Hoisting),
we can define the peer-connection event listeners before the `chat` variable is defined, 
even though we use the `chat` variable in the event listeners. This isn't a super
clean solution, but it works for this tutorial. If you want to build this application
as a real project, you should probably refactor this to allow both `app.js` and `chat.js`
to attach event listeners to the peer connection.

### Chat.js
The `chat.js` file is responsible for handling the UI and logic for the chat messages.
It's just a few lines of code:

```javascript
{% include_relative snippets/main/resources/public/js/chat.js %}
```

Most of the code is just for updating the UI, mainly because of the different
connection states that the peer connection can be in. The use of `#` in a
JavaScript class is an access modifier, similar to `private` in Java/Kotlin.

The class exposes two methods, `updateUi` and `addRemoteMessage`, which are used
in the callbacks for the peer connection defined in `app.js`. Again, this isn't a
super clean solution, so these should be attached to the peer-connection
instead of being exposed if you want to build this application as a real project.

### Peer-connection.js
This is by far the most complex file in the project, so let's start with a brief
introduction to [WebRTC and SDP](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection).

The way a WebRTC connection is established is by exchanging SDP messages between the 
two users (or "peers"). These SDP messages are typically exchanged over a WebSocket 
connection (as is the case with our app), but you could use REST or whatever else.
The way these messages are exchanged is not part of the WebRTC specification. 
Once the SDP exchange is complete, the media 
streams are sent directly between the peers (peer-to-peer).

To establish a connection, one peer must send an "offer" SDP message, and the other
must send an "answer" SDP message. In our application, who sends the offer and who 
sends the answer is determined by the "GO_FIRST" instruction, which is sent by the 
backend when the two peers are paired up. Deciding who goes first is not part of the
WebRTC specification, the two users just have to agree on it somehow.

The logic for the SDP exchange is different for the "offerer" (the user who goes first) 
and the "answerer" (the user who goes second). Let's go through both.

**The flow for the _"offerer"_ is as follows:**
1. Establish a WebSocket connection to the backend. 
2. Receive "PARTNER_FOUND" with the "GO_FIRST" instruction.
3. Create a peer connection, a data channel, and an [offer](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createOffer).
4. Set the local description of the peer connection to the offer.
5. Send the offer SDP message to the backend.
6. Wait for the answer SDP message from the backend and set it as the remote description.
7. Send ICE candidates to the backend as they are generated.
8. Receive peer [ICE candidates](https://developer.mozilla.org/en-US/docs/Web/API/RTCIceCandidate) 
   from the backend and add them to the connection.
9. The connection will be established based on the ICE candidates, after which video and audio streams can be
   sent and received. No `ondatachannel` event will be fired, since the data channel was created here in step 3.

**The flow for the _"answerer"_ is as follows:**
1. Establish a WebSocket connection to the backend.
2. Receive the "PARTNER_FOUND" (without the "GO_FIRST" instruction).
3. Wait for the offer SDP message from the backend.
4. Create a peer connection and set the remote description to the offer SDP message.
5. Create an [answer](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createAnswer)
   and set the local description to the answer.
6. Send the answer SDP message to the backend.
7. Send ICE candidates to the backend as they are generated.
8. Receive peer [ICE candidates](https://developer.mozilla.org/en-US/docs/Web/API/RTCIceCandidate)
   from the backend and add them to the connection.
9. The connection will be established based on the ICE candidates, after which video and audio streams can be 
   sent and received. An `ondatachannel` event will also be fired when the connection is 
   established, this is the same data channel that was created in step 3 for the "offerer".

The flows are similar, but the "offerer" must create the data channel and send the offer,
while the "answerer" must wait for the offer and send the answer. Both "offerer" and 
"answerer" exchange ICE candidates. The data channel is obtained at different times for 
the "offerer" and the "answerer", but it's the same data channel.

Alright, now it's finally time to look at the code:

```javascript
{% include_relative snippets/main/resources/public/js/peer-connection.js %}
```

This class encapsulates all of the WebRTC logic and exposes callbacks through
its constructor. This hopefully makes everything easy (or at least easier?) to follow. 
The most difficult part is probably keeping track of the different code paths for the "offerer"
and the "answerer". To help with this, the code contains comments for which parts 
are called exclusively by the "offerer" or the "answerer".

### Styling
The CSS is pretty simple. It uses a CSS grid to position and size the elements, and a few
CSS variables for spacing and border-radius. It also uses states set on the body to conditionally
show and hide elements. For example only 1 button out of 3 is show at the time:

```css
[data-state=NOT_CONNECTED] button#startPairing,         /* start button */
[data-state=DISCONNECTED_LOCAL] button#startPairing,    /* start button */
[data-state=DISCONNECTED_REMOTE] button#startPairing,   /* start button */
[data-state=CONNECTING] button#abortPairing,            /* abort button */
[data-state=CONNECTED] button#leavePairing {            /* leave button */
    display: block;
}
```

The full CSS is shown below:
```css
{% include_relative snippets/main/resources/public/styles.css %}
```

## Conclusion
That's it! We've built a simple Omegle clone using Javalin, WebRTC, and plain JavaScript.
The full code is available on GitHub (link below), configured using Maven. 
If you have been following the tutorial and copy-pasting, you are missing a favicon and an SVG spinner, 
both of which you can also find on GitHub. 

If you have any questions or comments, please reach out to us on 
[Discord](https://discord.com/invite/sgak4e5NKv) or [GitHub](https://github.com/javalin/javalin).
