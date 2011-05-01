var http = require('http')
  , url = require('url')
  , fs = require('fs')
  , io = require('socket.io')
  , sys = require('sys')
  , server;
    
server = http.createServer(function(req, res){
  var path = url.parse(req.url).pathname; // http://google.com/docs will result in path - /docs
  
  switch (path){
    // if now path is given, then show this default message to the client. We're sending them to index.html
    case '/':
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write('<h1>Enter the <a href="/index.html">Marker</a> example.</h1>');
      res.end();
      break;
    // for all other request, just serve the requested file. If you're just serving static files, a nicer way to do this is use the node_static add-on (https://github.com/cloudhead/node-static) , which serves static files without the need to parse them through JS.
    default:
      fs.readFile(__dirname + path, function(err, data){
        if (err) return send404(res); // if the file does not exist, show 404 errod (see func below)
        res.writeHead(200) //, {'Content-Type': path == *.'js' ? 'text/javascript' : 'text/html'})
        res.write(data, 'utf8');
        res.end();
      });
      break;

  }
}),

// display a 404 message to client 
send404 = function(res){
  res.writeHead(404);
  res.write('404');
  res.end();
};

server.listen(8080);


var io = io.listen(server)
  , buffer = [];
  
io.on('connection', function(client){
  client.send({ buffer: buffer });
  client.broadcast({ announcement: client.sessionId + ' connected' });
  
  client.on('message', function(message){
    var msg = { message: [client.sessionId, message] };
    buffer.push(msg);
    if (buffer.length > 15) buffer.shift();
    client.broadcast(msg);
  });

  client.on('disconnect', function(){
    client.broadcast({ announcement: client.sessionId + ' disconnected' });
  });
});
