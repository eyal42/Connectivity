tkr:select time:`time$timeLibra,pair,side,best_bid,best_ask,spread:best_ask-best_bid from tbl where ttype=`ticker

trade:select time:`time$timeLibra,pair,side,size,price,val:price*size from tbl where ttype=`match

select open:first price,close:last price,sum size,sum val by (`minute$time),side from trade

latency:select time:`time$timeLibra, lat:timeLibra-timeExchange from select `time$timeLibra,`time$timeExchange from tbl where ttype=`ticker

Trades:select time:`time$timeLibra,pair,side,price,size,val:size*price from tbl where ttype=`match,timeLibra within (.z.t-00:20:00.000;.z.t);

select avg price,sum size,sum val by `minute$time,side from Trades
sum exec size from Trades

select time:`time$timeLibra,pair,side,size,best_bid,price,best_ask from tbl where timeLibra within (.z.t-00:20:00.000;.z.t);

select time:`time$timeLibra from tbl where timeLibra within (.z.t-00:20:00.000;.z.t);

tt:exec time from (select time:`time$timeLibra from tbl); -1 string (min tt;max tt; (max tt)-min tt);
