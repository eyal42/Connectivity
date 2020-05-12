// Node.js / JavaScript sample
const WebSocket = require("rpc-websockets").Client;
const ws = new WebSocket("wss://ws.lightstream.bitflyer.com/json-rpc");
const channelName_1 = "lightning_executions_BTC_JPY";
const channelName_2 = "lightning_executions_FX_BTC_JPY";
const channelName_3 = "lightning_ticker_BTCJPY10JUN2018";
ws.on("open", () => {
    ws.call("subscribe", {
        channel:channelName_2
    });
});
ws.on("channelMessage", notify => {
    console.log(notify);
});
