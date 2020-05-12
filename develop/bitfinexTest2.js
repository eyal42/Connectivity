const WebSocket = require('ws')

const wss = new WebSocket('wss://api.bitfinex.com/ws/2')
wss.onopen = () => {
  var prot={
    'event': 'subscribe',
    'channel': 'trades',
    'symbol': "BTCUSD",
  };
  wss.send(JSON.stringify(prot));
};
wss.onmessage = (msg) => {
  console.log(msg.data);
};
