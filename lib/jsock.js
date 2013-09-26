(function(){

  //I should make this a UMD sometime
if (typeof module != 'undefined' && typeof module.exports != 'undefined') {
  module.exports = JSock
} else {
  window.jsock = JSock
}

JSock.DELIM = '$*#4@^75'

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
        if (buffer.indexOf(JSock.DELIM) < 0) {
          buffer += data.toString()
          return
        }

        var chunks = buffer.split(JSock.DELIM)
        for (var i = 0; i < chunks.length - 1; ++i) {
          try {
            var obj = JSON.parse(chunks[i])
          } catch (err) {
            this._errorCallback(err)
            return
          }
          callback(obj)
          buffer = chunks[chunks.length - 1]
        }
      })
      break;
    case 'error': 
      this._errorCallback = callback
      break;
    default:
      this.stream.on.apply(this.stream, arguments)
  }

}

JSock.prototype.write = function(obj) {
  this.stream.write(JSON.stringify(obj) + JSock.DELIM)
}

})();