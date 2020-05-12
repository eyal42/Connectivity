/////////////////////////////////////////////////
const WebSocket = require('ws')

var ws = new WebSocket('wss://api.gemini.com/v1/marketdata/btcusd?heartbeat=true&top_of_book=true&bids=true&offers=true&trades=true');

ws.onopen = () => {
  var date = new Date();
  console.log('Socket opened at '+date.toString()+'\n');
};
ws.onclose = () => {
  var date = new Date();
  console.log('Socket closed at '+date.toString()+'\n');
};
ws.onmessage = (fmsg) => {
  var msg=JSON.parse(fmsg.data);
  console.log(fmsg.data)
};
