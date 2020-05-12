//import GeminiAPI from 'gemini-api';
const GeminiAPI = require('gemini-api')

//const restClient = new GeminiAPI({ key, secret, sandbox: false });
//const websocketClient = new GeminiAPI.WebsocketClient({ key, secret, sandbox: false });
const websocketClient = new GeminiAPI.WebsocketClient();
/*
restClient.getOrderBook('btcusd', { limit_asks: 10, limit_bids: 10 })
  .then(console.log)
  .catch(console.error);
*/

websocketClient.openMarketSocket('btcusd', () => {
  websocketClient.addMarketMessageListener(data =>
    doSomethingCool(data)
  );
});

var doSomethingCool=function(data){
  console.log(data);
}


// The methods are bound properly, so feel free to destructure them:
/*
const { getTicker } = restClient;
getTicker('btcusd')
  .then(data =>
    console.log(`Last trade: $${data.last} / BTC`)
  )
  */
