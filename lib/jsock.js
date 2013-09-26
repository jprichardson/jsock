(function(globals){

//UMD
if (typeof define !== 'undefined' && define.amd) { //require.js / AMD
  define([], function() {
    return JSock
  })
} else if (typeof module !== 'undefined' && module.exports) { //CommonJS
  module.exports = JSock
} else {
  globals.jsock = JSock //<script>
}

JSock.DELIM = '$*#4@^75JP!'

function JSock (stream) {
  if (!(this instanceof JSock)) return new JSock(stream)

  this.stream = stream
  this._errorCallback = function(){}
}

JSock.prototype.on = function(event, callback) {
  var buffer = ''

  switch (event) {
    case 'data': 
      this.stream.on('data', function(data) {
        buffer += data.toString()
        if (buffer.indexOf(JSock.DELIM) < 0)
          return

        var chunks = buffer.split(JSock.DELIM)
        for (var i = 0; i < chunks.length - 1; ++i) {
          try {
            var obj = JSON.parse(chunks[i])
          } catch (err) {
            this._errorCallback(err)
            return
          }
          callback(obj)
        }
        buffer = chunks[chunks.length - 1]
      })
      break;
    case 'error': 
      this._errorCallback = callback
      this.stream.on('error', callback)
      break;
    default:
      this.stream.on.apply(this.stream, arguments)
  }

}

JSock.prototype.write = function(obj) {
  this.stream.write(JSON.stringify(obj) + JSock.DELIM)
}

})(this);