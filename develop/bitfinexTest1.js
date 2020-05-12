const WebSocket = require('ws')

const wss = new WebSocket('wss://api.bitfinex.com/ws/2')
wss.onopen = () => {
  var prot={
    'event': 'subscribe',
    'channel': 'book',
    'symbol': "BTC",
    'prec': 'P0',
    'freq': 'F0',
    'len': '25'
  };
  wss.send(JSON.stringify(prot));
};
wss.onmessage = (msg) => {
  console.log(msg.data);
  console.log("Hey hey hey")
};
