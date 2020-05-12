/////////////////////////////////////////////////
const WebSocket = require('ws')
const FileSocket = require('fs');

const dateObj = require('.././my_modules/myDate.js');
/////////////////////////////////////////////////
exchange='coinbase';
title=dateObj.getDateTitle(exchange);
port=1857;
console.log('connect via port: ',port);
const wslocal = new WebSocket('ws://localhost:'+port);
process.title=title+'_'+port;

console.log(process.title);
path_kdb=`${process.cwd()}/data/kdb/`; //console.log(path_data);
path_raw=`${process.cwd()}/data/raw/`; //console.log(path_data);
path_log=`${process.cwd()}/data//log/`; //console.log(path_log);

var rawDataStream = FileSocket.createWriteStream(path_raw+title+'.json', {'flags': 'a'});
var logStream = FileSocket.createWriteStream(path_log+title+'.log', {'flags': 'a'});
logStream.write(title+'\n');
logStream.write(path_kdb+'\n');
logStream.write(path_raw+'\n');
logStream.write(path_log+'\n');

var local_socket_flag=0;
var msg_2_send_flag=0;
var heartbeat_counter=0;
var heartbeat_lagged=0;
var date_lagged=new Date();
var start_time=new Date();

var ws = new WebSocket('wss://ws-feed.pro.coinbase.com');

/////////////////////////////////////////////////
wslocal.onopen = () => {
 var date = new Date();
 console.log('Socket opened at '+date.toString());
 logStream.write('Socket opened at '+date.toString()+'\n');
 setInterval(intervalPing, 3000);
 setInterval(intervalSave, 300000);
 local_socket_flag=1;
 var init_ob={
   'event': 'init',
   'prev_file': false,
   'time':date.getTime().toString(),
   'path': path_kdb,
   'title':title
 };
 wslocal.send(JSON.stringify(init_ob))
};
intervalPing=function() {
  var date = new Date();
  ttime=dateObj.getTime();
  var pob={
    'event':'ping',
    'timestamp':date.getTime()
  };
  beats=heartbeat_counter-heartbeat_lagged;
  heartbeat_lagged=heartbeat_counter;
  time_delta=(date-date_lagged)/1000;
  running_time=(date-start_time)/60000;
  date_lagged=date;
  console.log('ping '+ttime+' run time:'+running_time.toFixed(3)+'min  heartbeats '+beats.toString());
  wslocal.send(JSON.stringify(pob));
  if (beats<1){
    console.log('heartbeat down');
    logStream.write('heartbeat down\n');
    ws = new WebSocket('wss://ws-feed.pro.coinbase.com');
  }
};
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

wslocal.onclose = () => {
  var date = new Date();
  logStream.write('Disconnect: lost kdb connectivity' + date.toString()+'\n');
  console.log('Disconnect: lost kdb connectivity ' + date.toString());
};
wslocal.onmessage = (msg) => {
  var date = new Date();
  var ttime=dateObj.getTime();
  answr=JSON.parse(msg.data);
  console.log('pong '+ttime+' #rec:'+(answr['rec_count']).toString());
  logStream.write('pong '+ttime+' #rec:'+(answr['rec_count']).toString()+'\n');
};

ws.onopen = () => {
  var date = new Date();
  var subscribeObj={
    "type": "subscribe",
    "product_ids": ["BTC-USD"],
    "channels": [
            {"name": "heartbeat","product_ids": ["BTC-USD"]},
            {"name": "matches","product_ids": ["BTC-USD"]},
            {"name": "ticker","product_ids": ["BTC-USD"]}
          ]
  };
  ws.send(JSON.stringify(subscribeObj));
  logStream.write('Subscribed to '+subscribeObj['product_ids']+date.toString()+'\n');
};
ws.onclose = () => {
  var date = new Date();
  logStream.write('Disconnect: lost exchange connectivity'+date.toString()+'\n');
  console.log('Disconnect: lost exchange connectivity'+date.toString()+'\n');
};
ws.onmessage = (fmsg) => {
  rawDataStream.write(fmsg.data+'\n');
  var date = new Date();
  var timestamp = date.getTime();
  var msg=JSON.parse(fmsg.data);
  //console.log(msg.type)
  if (msg.type=="match"){
    ob=procMatch(msg)
    msg_2_send_flag=1;
  }
  else if (msg.type=="ticker"){
    ob=procTicker(msg)
    msg_2_send_flag=1;
  }
  else if (msg.type=="heartbeat"){
    msg_2_send_flag=0;
    heartbeat_counter+=1;
  }
  else if (msg.type=="error"){
    console.log(msg);
    msg_2_send_flag=0;
  }
  else{
    msg_2_send_flag=0;
  }
  if (local_socket_flag>0 && msg_2_send_flag>0){
    //console.log(ob);
    wslocal.send(JSON.stringify(ob));
    msg_2_send_flag=0;
  }
};
var procMatch = function(msg){
  var date = new Date();
  var nob={
    'event':'data',
    'ttype': 'match',
    'timeLibra':date.getTime().toString(),
    'timeExchange': msg.time,
    'side': msg.side,
    'size': msg.size,
    'price': msg.price,
    'trade_id': msg.maker_order_id,
    'maker_order_id': msg.maker_order_id,
    'taker_order_id': msg.taker_order_id,
    'product_id': msg.product_id,
    'sequence': msg.sequence.toString(),
    'source':'coinbase'
  };
  return(fillFields(nob));
}
var procTicker = function(msg){
  var date = new Date();
  var nob={
    'event': 'data',
    'ttype': 'ticker',
    'timeLibra':date.getTime().toString(),
    'timeExchange': msg.time,
    'price': msg.price,
    'best_bid': msg.best_bid,
    'best_ask': msg.best_ask,
    'side': msg.side,
    'open_24h': msg.open_24h,
    'volume_24h': msg.volume_24h,
    'low_24h': msg.low_24h,
    'high_24h': msg.high_24h,
    'volume_30d': msg.volume_30d,
    'sequence': msg.sequence.toString(),
    'product_id': msg.product_id,
    'trade_id': msg.trade_id,
    'last_size': msg.last_size,
    'source':'coinbase'
  };
  return(fillFields(nob));
}
var fillFields = function(obj) {
    var fields=[
                'event','ttype','timeLibra','timeExchange','side','size','price','trade_id','maker_order_id',
                'taker_order_id','product_id','sequence','price','best_bid','best_ask','side','open_24h',
                'volume_24h','low_24h','high_24h','volume_30d','sequence','trade_id','last_size','source'
              ];
    var result = Object.create(obj);
    for(var ii in fields) {
      if (fields[ii] in result){
        result[fields[ii]]=obj[fields[ii]]
      }
      else{
        result[fields[ii]]='';
      }
    }
    return result;
}
