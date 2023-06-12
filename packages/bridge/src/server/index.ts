import { Base } from '../base';
import {
    RpcServer
} from '../interfaces/rpc/server'

export class BridgeServer extends Base{

    interface:RpcServer
    constructor(options:Base.options) {
        super(options)
        this.interface = new RpcServer(this);
    }


    init() {
        this.interface.init();
    }



    register(func:Function) {
        this.interface.register(func)

    }


  
}


