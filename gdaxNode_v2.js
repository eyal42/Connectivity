/////////////////////////////////////////////////
const WebSocket = require('ws')

const ws = new WebSocket('wss://ws-feed.gdax.com')
if (process.argv[2]=='-p'){
  title='gdax';
  port=process.argv[3]
}
else{
  console.log('Error: missing port id');
  process.exit(1);
}
console.log('connect via port: ',port);
const wslocal = new WebSocket('ws://localhost:'+port);
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
var local_error_flag=0;

/////////////////////////////////////////////////

ws.onopen = () => {
  var date = new Date();
  var prot={
    "type": "subscribe",
    "product_ids": ["BTC-USD"],
    "channels": [{"name": "matches","product_ids": ["BTC-USD"]},{"name": "ticker","product_ids": ["BTC-USD"]}]
  };
  ws.send(JSON.stringify(prot));
  logStream.write('Subscribed to '+prot['product_ids']+date.toString()+'\n');
};


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
  ws.send('');
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

procMatch = function(msg){
  var date = new Date();
  var nob={
    'event':'data',
    'type': 'match',
    'timeLibra':date.getTime().toString(),
    'timeExchng': msg.time,
    'side': msg.side,
    'size': msg.size,
    'price': msg.price,
    'trade_id': msg.maker_order_id,
    'maker_order_id': msg.maker_order_id,
    'taker_order_id': msg.taker_order_id,
    'product_id': msg.product_id,
    'sequence': msg.sequence,
    'source':'gdax'
  };
  return fillFields(nob);
}

procTicker = function(msg){
  var date = new Date();
  var nob={
    'event': 'data',
    'type': 'ticker',
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
    'sequence': msg.sequence,
    'product_id': msg.product_id,
    'trade_id': msg.trade_id,
    'last_size': msg.last_size,
    'source':'gdax'
  };
  return fillFields(nob);
}

function fillFields(obj) {
    var fields=['event','type','timeLibra','timeExchng','side','size','price','trade_id','maker_order_id','taker_order_id','product_id','sequence','price','best_bid','best_ask','side','open_24h','volume_24h','low_24h','high_24h','volume_30d','sequence','trade_id','last_size','source','gdax'];
    var result = Object.create(obj);
    for(var ii in fields) {
      if (fields[ii] in result){
        result[fields[ii]]=obj[fields[ii]]
      }
      else{
        result[fields[ii]]=NaN
      }
    }
    return result;
}

ws.onmessage = (fmsg) => {
  var date = new Date();
  var timestamp = date.getTime();
  var msg=JSON.parse(fmsg.data);
  console.log(msg.type)
  if (msg.type=="match"){
    ob=procMatch(msg)
    local_error_flag=0
  }
  else if (msg.type=="ticker"){
    ob=procTicker(msg)
    local_error_flag=0
  }
  else if (msg.type=="error"){
    console.log(msg);
    local_error_flag=1
  }
  else{
    local_error_flag=1
  }
  if (local_socket_flag>0 && local_error_flag<1){
    console.log(ob);
    //wslocal.send(JSON.stringify(ob));
  }
};
