epoch_cnvrt:{[tt] :`timestamp$((tt*1000000)-946684800000000000)};

getFinType:{[strng]
 lst:"_" vs strng;
 :?[(`$(lst[2]))=`FX;`mrgn;`cash]
 };

procPage:{[msg]
  TimeLibra:epoch_cnvrt msg[`timestamp];
  FinType:getFinType[msg[`channel]];
  pg0:select timeBitFlyr:"Z"$exec_date,`$side,price,size,id,`$buy_child_order_acceptance_id,`$sell_child_order_acceptance_id from (msg[`message]);
  pg1:update timeLibra:TimeLibra,finType:FinType,source:`$msg[`source] from pg0;
  :select timeLibra,timeBitFlyr,side,price,size,finType,source,id,buy_child_order_acceptance_id,sell_child_order_acceptance_id from pg1
  };

save_disk:{-1"save table ",string .z.t;save `bitFlyerTbl;:1};
time_check:{kk:`int$(.z.t%1000) mod 180;if[(kk=1)&(flg=0);flg::1;save_disk 0];if[not kk=1;flg::0]};
.z.wo:{load `bitFlyerTbl;flg::0;-1"WebSocket opened at ",string .z.z};
.z.wc:{save `bitFlyerTbl;-1"WebSocket closed at ",string .z.z};
.z.ws:{pg:procPage[.j.k x];bitFlyerTbl::bitFlyerTbl,pg;last_update::`time$max exec timeLibra from bitFlyerTbl;time_check 0};
