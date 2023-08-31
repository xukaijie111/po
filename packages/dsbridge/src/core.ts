

import {
    MessageDataBase,
} from "@po/shared"

import {
    DsBridgeInterface,
    
} from "./interface"

export class DsBridge {
    interface:DsBridgeInterface
   callback:Function
    constructor(options:DsBridge.options) {

        this.interface = options.interface
    }


    init() {
        this.interface.init(this);
        this.interface.register(this.processRegisterRequest)
    }
    send(data:MessageDataBase) {
       return this.interface.send(data)
    }


    register (callback:Function) {
        this.callback = callback
    }

    processRegisterRequest = (params:MessageDataBase) => {
       if (this.callback) this.callback(params)
    }

}


export namespace DsBridge {

    export type options = {
        interface:DsBridgeInterface
    }
}