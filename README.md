jsock
=====

JavaScript component for easy JSON handling over sockets or streams. Works in Node.js or the browser.



Install
-------

### Node.js/Browserify

    npm install --save jsock


### Component

    component install jprichardson/jsock

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
  client = jsock(client)
  client.on('data', function(data) {
    console.log(data.type) //message
    console.log(data.contents) //Hello server!
    client.write({type: 'ack', contents: 'Welcome client!'})
  })
})

server.listen(PORT)

//simulate later in time
setTimeout(function() {
  client = jsock(net.createConnection(PORT))
  client.on('data', function(data) {
    console.log(data.type) //ack
    console.log(data.contents) //Welcome client!

    client.stream.end() //<--- notice accessing the original stream?
    server.close()
  })
  client.write({type: 'message', contents: "Hello server!"})
},250)
```


License
-------

(MIT License)

Copyright 2013, JP Richardson  <jprichardson@gmail.com>


