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
        //load `$"data/gdaxTbl";
        flg::0;
        -1"WebSocket opened at ",string .z.z
        };
.z.wc:{
        save `$"data/gdaxTbl";
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

gdaxTbl:()
rec_count:0;
last_update:.z.d;
