/////////////////////////////////////////////////
const WebSocket = require('ws')
const FileSocket = require('fs');

const dateObj = require('.././my_modules/myDate.js');
/////////////////////////////////////////////////
exchange='coinbase';
var date=new Date();
var ddate=dateObj.getDate();
var start_time=date.getTime();
var time_to_die=dateObj.getEndOfDayPlus();

if (process.argv[2]=='-p'){
  port=process.argv[3]
}
else{
  port=1857;
  //process.exit(1);
}
console.log('connect via port: ',port);
const wslocal = new WebSocket('ws://localhost:'+port);
process.title=exchange+'_'+port;
console.log(process.title);
path_kdb=`${process.cwd()}/data/kdb/`; //console.log(path_data);
path_raw=`${process.cwd()}/data/raw/`; //console.log(path_data);
path_log=`${process.cwd()}/data//log/`; //console.log(path_log);
console.log('started:'+start_time.toString()+' will end:'+time_to_die.toString());

var rawDataStream = FileSocket.createWriteStream(path_raw+exchange+'_'+ddate+'.json', {'flags': 'a'});
var logStream = FileSocket.createWriteStream(path_log+exchange+'_'+ddate+'.log', {'flags': 'a'});
logStream.write(exchange+'_'+ddate+'\n');
logStream.write(path_kdb+'\n');
logStream.write(path_raw+'\n');
logStream.write(path_log+'\n');

var local_socket_flag=0;
var msg_2_send_flag=0;

var vital_ob={
  'event':'ping',
  'ping_time':0,
  'pong_time':0,
  'ping_pong_delta':0,
  'missed_pongs':0,
  'running_time':0,
  'heartbeats':0,
  'heartbeat_delta':0,
  'missed_heartbeats':0,
  'messages':0,
  'records':0,
  'record_delta':0,
  'volume':0,
  'volume_delta':0
};
var ws = new WebSocket('wss://ws-feed.pro.coinbase.com');

pairs=['BTC-USD','ETH-USD','ETH-BTC','LTC-USD','LTC-BTC','BCH-USD','BCH-BTC'];
/////////////////////////////////////////////////
wslocal.onopen = () => {
 var ttime=dateObj.getTime();
 var ddate=dateObj.getDate();
 console.log('Socket opened at '+ttime);
 logStream.write('Socket opened at '+ttime+'\n');
 setInterval(intervalPing, 5000);   // ping pong every 3 sec
 setInterval(intervalSave, 60000); // save every 5 min
 local_socket_flag=1;
 var init_ob={
   'event': 'init',
   'time':ttime,
   'date':ddate,
   'path': path_kdb,
   'exchange':exchange
 };
 wslocal.send(JSON.stringify(init_ob))
};
wslocal.onclose = () => {
  var date = new Date();
  logStream.write('Disconnect: lost kdb connectivity'+dateObj.getTime()+'\n');
  console.log('Disconnect: lost kdb connectivity '+dateObj.getTime());
};
wslocal.onmessage = (msg) => {
  answr=JSON.parse(msg.data);
  updateVitalsOnPong(answr['rec_count'])
};

ws.onopen = () => {
  var subscribeObj={
    "type": "subscribe",
    "product_ids": pairs,
    "channels": [
            {"name": "heartbeat","product_ids": ['BTC-USD']},
            {"name": "matches","product_ids": pairs},
            {"name": "ticker","product_ids": pairs}
          ]
  };
  ws.send(JSON.stringify(subscribeObj));
  logStream.write('Subscribed to '+subscribeObj['product_ids']+' '+dateObj.getTime()+'\n');
};
ws.onclose = () => {
  var date = new Date();
  logStream.write('Disconnect: lost exchange connectivity'+dateObj.getTime()+'\n');
  console.log('Disconnect: lost exchange connectivity'+dateObj.getTime());
};
ws.onmessage = (fmsg) => {
  rawDataStream.write(fmsg.data+'\n');
  var msg=JSON.parse(fmsg.data);
  procMessage(msg);
};

intervalPing=() => {
  ttime=dateObj.getTime();
  log_string=ttime+' run time:'+(vital_ob.running_time/60000).toFixed(3)+' heartbeat:'+vital_ob.heartbeat_delta.toString()+' #msg:'+vital_ob.messages.toString()+' #rec:'+vital_ob.record_delta.toString()+' vol:'+vital_ob.volume_delta.toString();
  console.log(log_string)
  logStream.write(log_string+'\n');
  wslocal.send(JSON.stringify(vital_ob));
  healthCheck()
  updateVitalsOnPing();
};
updateVitalsOnPing=() => {
  var date = new Date();
  vital_ob.ping_time=date.getTime();
  vital_ob.unaswered_pongs+=1;
  vital_ob.running_time=vital_ob.ping_time-start_time;
  vital_ob.heartbeat_delta=0;
  vital_ob.volume_delta=0;
};
updateVitalsOnPong=(rec_count) => {
  var date = new Date();
  vital_ob.pong_time=date.getTime();
  vital_ob.ping_pong_delta=vital_ob.pong_time-vital_ob.ping_time;
  vital_ob.unaswered_pongs=0;
  vital_ob.record_delta=rec_count-vital_ob.records,
  vital_ob.records=rec_count
};
healthCheck=() => {
  nnow=new Date();
  if (vital_ob.missed_heartbeats>3 | nnow.getTime()>time_to_die ){
    process.exit(1);
  };
  if (vital_ob.heartbeat_delta<1){
    console.log('heartbeat down missed '+vital_ob.missed_heartbeats.toString());
    logStream.write('heartbeat down missed '+vital_ob.missed_heartbeats.toString()+'\n');
    vital_ob.missed_heartbeats+=1;
    ws = new WebSocket('wss://ws-feed.pro.coinbase.com');
  };
};
intervalSave=() => {
  var date = new Date();
  var sob={
    'event':'save',
    'time':date.getTime()
  };
  console.log('save',dateObj.getTime());
  logStream.write('save '+dateObj.getTime()+'\n');
  wslocal.send(JSON.stringify(sob));
}

var procMessage = (msg) => {
  //console.log(msg.type,vital_ob.heartbeats,vital_ob.heartbeat_delta)
  if (msg.type=="subscriptions"){
    console.log('subscribed')
    msg_2_send_flag=0;
  }
  else if (msg.type=="match"){
    ob=procMatch(msg)
    vital_ob.messages+=1
    //vital_ob.volume_delta+=msg.size
    //vital_ob.volume+=msg.size
    msg_2_send_flag=1;
  }
  else if (msg.type=="ticker"){
    ob=procTicker(msg)
    vital_ob.messages+=1
    msg_2_send_flag=1;
  }
  else if (msg.type=="heartbeat"){
    msg_2_send_flag=0;
    vital_ob.heartbeat_delta+=1;
    vital_ob.heartbeats+=1;
    if (vital_ob.missed_heartbeats>0){
      console.log('heartbeat back to '+vital_ob.heartbeat_delta.toString());
      vital_ob.missed_heartbeats=0;
    };
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
var procMatch = (msg) => {
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
var procTicker = (msg) => {
  var date = new Date();
  var nob={
    'event': 'data',
    'ttype': 'ticker',
    'timeLibra':date.getTime().toString(),
    'timeExchange': msg.time,
    'price': msg.price,
    'bid': msg.best_bid,
    'ask': msg.best_ask,
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
var fillFields = (obj) => {
    var fields=[
                'event','ttype','timeLibra','timeExchange','side','size','price','trade_id','maker_order_id',
                'taker_order_id','product_id','sequence','price','bid','ask','side','open_24h',
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
