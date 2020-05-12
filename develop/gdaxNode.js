const WebSocket = require('ws')
const wss = new WebSocket('wss://ws-feed.gdax.com')
wss.onopen = () => {
  /*
  var prot={
    "type": "subscribe",
    "product_ids": ["BTC-USD","BTC-EUR"],
    "channels": ["level2","heartbeat",{"name": "ticker","product_ids": ["BTC-USD","BTC-EUR"]}]
  };
  */
  var prot={
    "type": "subscribe",
    "product_ids": ["BTC-USD"],
    "channels": [{"name": "matches","product_ids": ["BTC-USD"]},{"name": "ticker","product_ids": ["BTC-USD"]}]
  };
  wss.send(JSON.stringify(prot));
};
wss.onmessage = (msg) => {
  console.log('-----',JSON.parse(msg.data));
};
