var testutil = require('testutil')
  , jsock = require('../lib/jsock')
  , net = require('net')
  , next = require('nextflow')

var PORT = 45643

describe('+ jsock', function() {
  it('should communicate with another tcp socket', function(done) {
    var server, flow;

    next(flow={
      ERROR: done,
      createServer: function() {
        var server = net.createServer(function(client) {
          client = jsock(client)
          client.on('data', function(data) {
            EQ (data.type, 'message')
            EQ (data.contents, 'hello man!')
            done()
          })
        })
        server.listen(PORT, flow.next)
      },
      createClient: function() {
        var client = jsock(net.createConnection(PORT))
        client.write({type: 'message', contents: 'hello man!'})
      }
    })
  })
})


