
.z.wo:{
        -1"WebSocket opened at ",string .z.z
        };
.z.wc:{
        -1"WebSocket closed at ",string .z.z;
        tmp_taq::select from TaqTbl where (`date$timeLibra)=standing_date;
        value "`:",file_name," set tmp_taq;";
        tmp_vtl::select from VitalTbl where (`date$ping_time)=standing_date;
        value "`:",file_name," set tmp_vtl;";
        :1
        };
.z.ws:{[x]
        msg: .j.k x;
        xx::msg;
        if[ msg[`event] like "init" ; init_event[msg]];
        if[ msg[`event] like "ping" ; ping_event[msg] ];
        if[ msg[`event] like "save" ; save_event[msg]];
        if[ msg[`event] like "data" ; data_event[msg]];
        {} 0
        };

\cd ./data/kdb/
file_name:"";
rec_count:0;
standing_date:.z.d;
coverge_time:0;
TaqTbl:() ; yy0:() ; yy1:() ; yy2:();
VitalTbl:();
tmp_taq:() ;  tmp_vtl:() ;
init_event:{[msg]
            -1 msg[`event],"  ",string `time$.z.z;
            exchange::msg[`exchange];
            file_name::exchange,"_",msg[`date];
            standing_date::"D"$("-" sv "_" vs msg[`date]);
            dir_files:system "ls";
            if[file_name in dir_files; {
                                        -1"Load Files";
                                        value ("TaqTbl::get `:",file_name);
                                        value ("VitalTbl::get `:",file_name,"_vtl");
                                        :1
                                        }];
            :1
            };
ping_event:{[vtl]
            pob: .j.j (`rec_count`coverge_time!(rec_count;coverge_time));
            neg[.z.w] pob;
            pg:select epoch_cnvrt[ping_time],ping_pong_delta,missed_pongs,running_time,heartbeats,heartbeat_delta,missed_heartbeats,messages,records,record_delta,volume,volume_delta from enlist vtl;
            yy2::pg;
            VitalTbl::VitalTbl,pg;
            :1
            };
save_event:{[msg]
            -1 msg[`event],"  ",string `time$.z.z;
            tmp_taq::select from TaqTbl where (`date$timeLibra)=standing_date;
            value "`:",file_name," set tmp_taq;";
            tmp_vtl::select from VitalTbl where (`date$ping_time)=standing_date;
            value "`:",file_name,"_vtl set tmp_vtl;";
            :1
            };
epoch_cnvrt:{[tt]
              :`timestamp$((tt*1000000)-946684800000000000)
              };
data_event:{[msg]
            yy0::msg;
            pg:procCoinbase[msg];
            pg:update epoch_cnvrt["J"$timeLibra] from pg;
            yy1::pg;
            TaqTbl::TaqTbl,enlist pg;
            last_update::`time$max exec timeLibra from TaqTbl;
            rec_count::count TaqTbl;
            };

procCoinbase:{[msg]
          //if[not (msg[`timeExchange]="");msg[`timeExchange]:"Z"$msg[`timeExchange]];
          :select timeLibra,"Z"$timeExchange,pair:`$product_id,`$side ,"F"$price,"F"$bid,"F"$ask,"F"$size,"F"$open_24h,"F"$volume_24h,"F"$low_24h,"F"$high_24h,"F"$volume_30d,"F"$last_size,trade_id,maker_order_id,taker_order_id,"J"$sequence,`$source,`$ttype from msg
          };
