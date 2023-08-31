

import {
    DsBridgeInterface
} from "@po/dsbridge"

import {
    MessageDataBase
} from "@po/shared"




export class Android implements DsBridgeInterface {


        
        get bridge() {
            //@ts-ignore
            return bridge
        }

        send(data:MessageDataBase) {
            return this.bridge.send(data)
        }


        init() {


        }


        register(func:Function) {


        }




}