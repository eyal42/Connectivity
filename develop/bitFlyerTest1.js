// Node.js / JavaScript sample
const WebSocket = require("rpc-websockets").Client;
const ws = new WebSocket("wss://ws.lightstream.bitflyer.com/json-rpc");
//const channelName = "lightning_ticker_BTC_JPY";
const channelName = "lightning_executions_FX_BTC_JPY";
ws.on("open", () => {
    ws.call("subscribe", {
        channel:channelName
    });
});
ws.on("channelMessage", notify => {
    console.log(notify);
});
