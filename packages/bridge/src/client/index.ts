
import {
    RpcClient
} from '../interfaces/rpc/client'

import {
    BridgeDataBase
} from '../base/protocol'
import { Base } from '../base';

export class BridgeClient extends Base{

    interface:RpcClient

    constructor(options:Base.options) {
        super(options)
        this.interface = new RpcClient(this);

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


   

}


