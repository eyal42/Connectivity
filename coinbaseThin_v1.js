const WebSocket = require('ws')
const FileSocket = require('fs');

const dateObj = require('.././my_modules/myDate.js');
/////////////////////////////////////////////////
exchange='coinbase';
var date=new Date();
var ddate=dateObj.getDate();
var start_time=date.getTime();
var time_to_die=dateObj.getEndOfDayPlus();

path_raw=`${process.cwd()}/data/raw/`; //console.log(path_data);
path_log=`${process.cwd()}/data//log/`; //console.log(path_log);
console.log('started:'+start_time.toString()+' will end:'+time_to_die.toString());

var rawDataStream = FileSocket.createWriteStream(path_raw+exchange+'_thin_'+ddate+'.json', {'flags': 'a'});
//var logStream = FileSocket.createWriteStream(path_log+exchange+'_'+ddate+'.log', {'flags': 'a'});

var ws = new WebSocket('wss://ws-feed.pro.coinbase.com');

pairs=['BTC-USD','ETH-USD','ETH-BTC','LTC-USD','LTC-BTC','BCH-USD','BCH-BTC'];
/////////////////////////////////////////////////

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
  console.log('Subscribed to '+subscribeObj['product_ids']+' '+dateObj.getTime());
};
ws.onclose = () => {
  var date = new Date();
  logStream.write('Disconnect: lost exchange connectivity'+dateObj.getTime()+'\n');
  console.log('Disconnect: lost exchange connectivity'+dateObj.getTime());
};
ws.onmessage = (fmsg) => {
  rawDataStream.write(fmsg.data+'\n');
  var msg=JSON.parse(fmsg.data);
  console.log(fmsg.data)
};
