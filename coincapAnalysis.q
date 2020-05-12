//timestamp,base_asset_code,counter_asset_code,average,volume,,
cutoff:17:00:00;

tbl:("SSSFJ";",") 0:`$"data/TueTbl.csv";
cTbl0:([] timestamp:tbl[0];base_asset_code:tbl[1];counter_asset_code:tbl[2];average:tbl[3];volume:tbl[4]);
cTbl0:1_update wndw:24*60*deltas time from `time xasc select time:"Z"$string timestamp,base:base_asset_code,cntr:counter_asset_code,price_cc:average,vol:volume from cTbl0;
cTbl1:select time+04:00:00.000,base,cntr,price_cc,vol,wndw from cTbl0;
cTbl:update `time$time from(select from cTbl1 where (`date$time)=2018.07.30);
cTbl:select from (select time,base,cntr,price_cc,vol,wndw from cTbl) where time<cutoff;
ccTbl:select time,price_cc from cTbl;

TaqTbl:get `$":data/coinbase_2018_7_30";
gdaxTbl:select from TaqTbl where pair=`$"BTC-USD",timeLibra within(2018.07.30T00:00:00.000;2018.07.30T17:00:00.000),ttype=`ticker;
gdaxTbl:select from (select time:`time$timeExchange,bid,ask from gdaxTbl) where time<cutoff;
ggdaxTbl:select min bid, max ask by 300000 xbar time from gdaxTbl;

tbl:aj[`time;select time from ggdaxTbl;ccTbl];
cmpTbl:ggdaxTbl lj 1!tbl;
//cmpTbl:update  diff:price_cc-0.5*(bid+ask) from cmpTbl;
cmpTbl:select time, bid, mid:0.5*(bid+ask),price_cc,ask,diff:price_cc-0.5*(bid+ask) from cmpTbl;
cmpTblb:select time,bid,mid,price_cc,ask,diff_USD:diff,diff_bips:10000*diff%mid from cmpTbl;
hist1:select count i by 5 xbar diff from select diff from cmpTbl;

tbl2:aj[`time;select time from ccTbl;gdaxTbl];
cmpTbl2:ccTbl lj 1!tbl2;
cmpTbl2:select time, bid, mid:0.5*(bid+ask),price_cc,ask,diff:price_cc-0.5*(bid+ask) from cmpTbl2;
cmpTbl2b:select time,bid,mid,price_cc,ask,diff_USD:diff,diff_bips:10000*diff%mid from cmpTbl2;
hist2:select count i by 5 xbar diff from select diff from cmpTbl2;

cmpTbl3:1_select time,deltas price_cc,deltas mid from (select time,log price_cc,log mid from cmpTbl2);

xx0:cmpTbl3[`price_cc];
xx1:cmpTbl3[`mid];

ff:{[str0;str1;ii]
        x0:value ((string ii),str0);
        x1:value ((string (-1*ii)),str1);
        ccor:cor[x0;x1];
        :ccor
        };

lng:20
res:([] lag:til lng+1; corr:(cor[xx0;xx1]),(ff["_xx0";"_xx1"] each 1+til lng) ; autocor_cc:(cor[xx0;xx0]),(ff["_xx0";"_xx0"] each 1+til lng) ; autocor_cb:(cor[xx1;xx1]),(ff["_xx1";"_xx1"] each 1+til lng));
