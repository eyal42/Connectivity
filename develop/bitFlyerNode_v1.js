const WebSocket = require("rpc-websockets").Client;
const ws = new WebSocket("wss://ws.lightstream.bitflyer.com/json-rpc");
const channelName1 = "lightning_executions_BTC_JPY";
const channelName2 = "lightning_executions_FX_BTC_JPY";

const WebSocket_loc = require('ws');
const wslocal = new WebSocket_loc('ws://localhost:1854');

var local_socket_flag=0;

ws.on("open", () => {
  ws.call("subscribe", {channel:channelName1});
  ws.call("subscribe", {channel:channelName2});
});

wslocal.on('open',function open() {
 console.log('Local open');
 local_socket_flag=1;
});

procObj = function(timestamp,notify){
  var nob={
    'timestamp':timestamp,
    'channel':notify.channel,
    'message':notify.message,
    'source':'bitFlyer'
  };
  return nob;
}

ws.on("channelMessage", notify => {
  var date = new Date();
  var timestamp = date.getTime()
  /*
  if (notify.channel=="lightning_executions_BTC_JPY"){
    console.log(date.toUTCString()," cash ",notify.message[0]['size']);
  }
  else if (notify.channel=="lightning_executions_FX_BTC_JPY"){
    console.log(date.toUTCString()," mrgn ",notify.message[0]['size']);
  }
  */
  if (local_socket_flag>0){
    wslocal.send(JSON.stringify(procObj(timestamp,notify)));
  }
});
