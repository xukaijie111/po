
import {
    RpcClient
} from '../interfaces/rpc/client'

import {
    PROTOCOL_CMD,
    BridgeDataBase
} from '../base/protocol'
import { Base } from '../base';

export * from '../base/protocol'

export class BridgeClient extends Base{

    interface:RpcClient

    callbacks:Map<PROTOCOL_CMD,Function>
    constructor(options:Base.options) {
        super(options)
        this.interface = new RpcClient(this);
        this.callbacks = new Map();

    }


    init() {
        this.interface.init()
    }


    uninit(){
        this.interface.uninit();
    }

    async send(data:BridgeDataBase) {
        return this.interface.send(data);
    }


    on(data:BridgeDataBase) {
        let { type  } = data;
        let func = this.callbacks.get(type)
        if (func) func(data)
    }

    register(cmd:PROTOCOL_CMD,func:Function) {
        this.callbacks.set(cmd,func)
    }


    
   

}


