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

data_event:{[msg]
            pg:procPage[msg];
            bitFlyerTbl::bitFlyerTbl,pg;
            last_update::`time$max exec timeLibra from bitFlyerTbl;
            rec_count::count bitFlyerTbl;
            };

ping_event:{[msg]
            //-1 msg[`event]," ",(string (`time$.z.z))," last update ",(string last_update)," rec count ",(string rec_count);
            pob: .j.j (`rec_count`last_update!(rec_count;last_update));
            neg[.z.w] pob;
            //neg[.z.w] "pong"
            :1
            };

save_event:{[msg]
            -1 msg[`event],"  ",string `time$.z.z;
            save `$"data/bitFlyerTbl";
            :1
            };

.z.wo:{
        load `$"data/bitFlyerTbl";
        flg::0;
        -1"WebSocket opened at ",string .z.z
        };
.z.wc:{
        save `$"data/bitFlyerTbl";
        -1"WebSocket closed at ",string .z.z
        };

.z.ws:{[x]
        msg: .j.k x;
        xx::msg;
        if[ msg[`event] like "ping" ; ping_event[msg] ];
        if[ msg[`event] like "data" ; data_event[msg]];
        if[ msg[`event] like "save" ; save_event[msg]];
        if[ msg[`event] like "ticker" ; 1];
        {} 0
        };

rec_count:0;
last_update:.z.d;
