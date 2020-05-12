const WebSocket = require('ws');

var ws = new WebSocket("ws://localhost:1858");
ws.on('open', function open() {
ws.send("ff:1234");
});
 
ws.on('message', function incoming(data) {
  console.log(data);
}); 
