

import {
    MessageDataBase,
} from "@po/shared"

import {
    DsBridgeInterface,
    
} from "./interface"

export class DsBridge {
    interface:DsBridgeInterface
   callback:Function
   inited = false
    constructor(options:DsBridge.options) {
        this.interface = options.interface
        this.init();
    }

    checkConnectStatus() {

        return this.interface.checkConnectStatus();
    }

    async init() {
        if (this.inited) return ;
        this.inited = true;
        await this.interface.init(this);
        await this.interface.register(this.processRegisterRequest)
    }
    send(data:MessageDataBase) {
       return this.interface.send(data)
    }


    register (callback:Function) {
        this.callback = callback
    }

    processRegisterRequest = (params:MessageDataBase) => {
       if (this.callback) return this.callback(params)
    }

}


export namespace DsBridge {

    export type options = {
        interface:DsBridgeInterface
    }
}