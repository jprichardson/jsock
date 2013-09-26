jsock
=====

JavaScript component for easy JSON handling over sockets or streams. Works in Node.js or the browser.


Why?
----

Writing raw text over streams or WebSockets is typically not enough to support robust communications between client and server. Let's assume that you need to pass different types of data such as configuration information and messages. How would you do this? How would the client know which is which?

One simple solution is to develop a JSON protocol to handle this:


**config data:**
```js
{
  "type": "config",
  "contents": {/* config info */}
}
```

**message data:**
```js
{
  "type": "message",
  "contents": "Your son shall be named Chalupa Batman!"
}
```

If your JSON objects are too large, you can't simply `stringify()` it and assume that the full message will be received in one data read on the client. You must use a technique called [framing][framing] to solve this problem. This is a fancy way of saying that you need to delimit your data so that the receiving end can tell the beginning and the end. `jsock` does this for you automatically. Now you can build robust communication protocols within Node.js and within the browser.



Name
----

**jsock** = JSON over sockets.



Install
-------

### Node.js/Browserify

    npm install --save jsock


### Component

    component install jprichardson/jsock


### Bower

    bower install jsock


### Script

```html
<script src="/path/to/jsock.js"></script>
```


Usage
-----

All you need to worry about are two things:

1. The `jsock` function.
2. The only input to the `jsock` function either a readable, writeable, or duplex (both) stream. This means that the input object must have either `write()` function or a `on('data', data)` function, or both. That's it. Easy.


Misc:

- If you want to access the original input stream object, access the `stream` property.
- If you want to modify the delimiter, access the `jsock.DELIM` property.


### Examples


#### Node.js

This simulates a server and a client connecting.

```js
var jsock = require('jsock')
  , net = require('net')

var PORT = 45643

var server = net.createServer(function(client) {
  var client = jsock(client)
  client.on('data', function(data) {
    console.log(data.type) //message
    console.log(data.contents) //Hello server!
    client.write({type: 'ack', contents: 'Welcome client!'})
  })
})

server.listen(PORT)

//simulate later in time
setTimeout(function() {
  var client = jsock(net.createConnection(PORT))
  client.on('data', function(data) {
    console.log(data.type) //ack
    console.log(data.contents) //Welcome client!

    client.stream.end() //<--- notice accessing the original stream?
    server.close()
  })
  client.write({type: 'message', contents: "Hello server!"})
},250)
```

#### Node.js / Browserify

One of the easiest ways to communicate between the browser and Node.js is to use Websockets. Specifically, [shoe](https://github.com/substack/shoe). Shoe is a wrapper around [sockjs](https://github.com/sockjs) that makes the Websockets more Node.js stream like.

**server.js**:
```js
var express = require('express') //<--- not necessary, but here for example
  , http = require('http')
  , shoe = require('shoe')
  , jsock = require('jsock')

var app = express()

/**
  ... express config here ...
**/

var server = http.createServer(app)

var sock = shoe(function(stream) {
  var jsockStream = jsock(stream) //stream is your websocket client connecting

  jsockStream.on('data', function(data) {
    console.log(data.type) //message
    console.log(data.message) //hey web server!
    jsockStream.write({type: 'message', content: 'hey web browser'})
  })
})

server.listen(app.get('port'), function(){
  console.log("Web server listening in %s on port %d", process.env.NODE_ENV, app.get('port'));
})

sock.install(server, '/data') //<--- websocket path, name it whatever as long as it doesn't conflict with your express routes
```

**client.js**: (this should be in your browser)
```js
var shoe = require('shoe')
  , jsock = require('jsock')

var stream = shoe('/data')
var jsockStream = jsock(stream)

jsockStream.on('data', function(data) {
  console.log(data.type) //message
  console.log(data.message) //hey web browser
})
jsockStream.write({type: 'message', content: 'hey web server!'})
```


#### Node.js / Browser WebSockets

You can use this with plain old WebSockets as well.  I may modify jsock to do this mapping for you.

This has not been tested, but something like this should work:

```js
var origin = window.location.origin.split('//')[1]
var ws = new WebSocket('ws://' + origin + '/data') //<--- path that you define on the server
ws.write = ws.send //map 'send' to 'write'

//create on('data') event
ws.on = function(event, callback) {
  if (event === 'data') {
    ws.onmessage = function(event) {
      callback(event.data)
    }
  }
}

var jsockStream = jsock(ws) 

//now use jsockStream as you would

```



License
-------

(MIT License)

Copyright 2013, JP Richardson  <jprichardson@gmail.com>

[framing]: http://en.wikipedia.org/wiki/Frame_(networking)


