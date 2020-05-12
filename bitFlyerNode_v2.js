/////////////////////////////////////////////////
const WebSocket = require("rpc-websockets").Client;
var ws = new WebSocket("wss://ws.lightstream.bitflyer.com/json-rpc");
const channelName1 = "lightning_executions_BTC_JPY";
const channelName2 = "lightning_executions_FX_BTC_JPY";
const channelName3 = "lightning_board_BTC_JPY";
const channelName4 = "lightning_board_FX_BTC_JPY";

const WebSocket_loc = require('ws');
if (process.argv[2]=='-p'){
  title='bitFlyer';
  port=process.argv[3]
}
else{
  console.log('Error: missing port id');
  process.exit(1);
}
console.log('connect via port: ',port);
const wslocal = new WebSocket_loc('ws://localhost:'+port);
process.title=title+'_'+port;

console.log(process.title);
path_data=`${process.cwd()}/data/`; console.log(path_data);
path_log=`${process.cwd()}/log/`; console.log(path_log);

const fs = require('fs');
var logStream = fs.createWriteStream(path_log+title+'.log', {'flags': 'a'});
logStream.write(title+'\n');
logStream.write(path_data+'\n');
logStream.write(path_log+'\n');

var local_socket_flag=0;

/////////////////////////////////////////////////


ws.on("open", () => {
  var date = new Date();
  ws.call("subscribe", {channel:channelName1});
  logStream.write('Subscribed to '+channelName1+date.toString()+'\n');
  ws.call("subscribe", {channel:channelName2});
  logStream.write('Subscribed to '+channelName2+date.toString()+'\n');
  ws.call("subscribe", {channel:channelName3});
  logStream.write('Subscribed to '+channelName3+date.toString()+'\n');
  ws.call("subscribe", {channel:channelName4});
  logStream.write('Subscribed to '+channelName4+date.toString()+'\n');
});

ws.on("close", () => {
  var date = new Date();
  logStream.write('Disconnect: connectivity lost at '+date.toString()+'\n');
  console.log('Disconnect: connectivity lost '+date.toString());
});

wslocal.on('open',function open() {
 var date = new Date();
 console.log('Socket opened at '+date.toString());
 logStream.write('Socket opened at '+date.toString()+'\n');
 setInterval(intervalPing, 15000);
 setInterval(intervalSave, 300000);
 local_socket_flag=1;
});

intervalPing=function() {
  var date = new Date();
  var pob={
    'event':'ping',
    'timestamp':date.getTime()
  };
  //console.log('ping',date.getTime());
  //logStream.write('ping '+date.getTime().toString()+'\n');
  wslocal.send(JSON.stringify(pob));
  ws.notify('');
}

intervalSave=function() {
  var date = new Date();
  var sob={
    'event':'save',
    'timestamp':date.getTime()
  };
  console.log('save',date.getTime());
  logStream.write('save '+date.getTime().toString()+'\n');
  wslocal.send(JSON.stringify(sob));
}

wslocal.onmessage=function(msg){
  var date = new Date();
  answr=JSON.parse(msg.data);
  console.log('pong '+date.getTime().toString()+' #rec:'+(answr['rec_count']).toString());
  logStream.write('pong '+date.getTime().toString()+' #rec:'+(answr['rec_count']).toString()+'\n');
};

procTrade = function(timestamp,notify){
  var nob={
    'event':'data',
    'timestamp':timestamp,
    'channel':notify.channel,
    'message':notify.message,
    'source':'bitFlyer'
  };
  return nob;
}

procTicker = function(timestamp,notify){
  var nob={
    'event':'ticker',
    'timestamp':timestamp,
    //'channel':notify.channel,
    //'message':notify.message,
    'source':'bitFlyer'
  };
  return nob;
}

ws.on("channelMessage", notify => {
  var date = new Date();
  var timestamp = date.getTime();
  if (notify.channel=="lightning_executions_BTC_JPY"){
    //console.log(date.getTime().toString()+' cash ',notify.message[0]['price'],notify.message[0]['size']);
    ob=procTrade(timestamp,notify)
  }
  else if (notify.channel=="lightning_executions_FX_BTC_JPY"){
    //console.log(date.getTime().toString()+' mrgn ',notify.message[0]['price'],notify.message[0]['size']);
    ob=procTrade(timestamp,notify)
  }
  else if (notify.channel=="lightning_board_BTC_JPY"){
    //console.log('cash mid ',notify.message['mid_price']);
    ob=procTicker(timestamp,notify)
  }
  else if (notify.channel=="lightning_board_FX_BTC_JPY"){
    //console.log('mrgn mid ',notify.message['mid_price']);
    ob=procTicker(timestamp,notify)
  }
  if (local_socket_flag>0){
    wslocal.send(JSON.stringify(ob));
  }
});
