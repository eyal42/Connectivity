const WebSocket = require('ws');

var ws = new WebSocket('wss://ws.coinapi.io/v1/');
var wslocal = new WebSocket('ws://localhost:1857');
ws.on('open', function open() {
var hello = {
  "type": "hello",
  "apikey": "AF0E5375-FDBC-4138-B71B-2B85A876AAF0",
  "heartbeat": false,
  "subscribe_data_type": ["trade"],
  "subscribe_filter_asset_id": ["BTC", "ETH"]
};
ws.send(JSON.stringify(hello));
});

wslocal.on('open',function open() {
 console.log('Local open');
});

ws.on('message', function incoming(data) {
  console.log(data);
  wslocal.send(data);
});
