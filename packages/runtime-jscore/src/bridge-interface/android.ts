

import {
    DsBridgeInterface
} from "@po/dsbridge"

import {
    MessageDataBase
} from "@po/shared"




export default class  Android implements DsBridgeInterface {


        
        get bridge() {
            //@ts-ignore
            return bridge
        }

       async send(data:MessageDataBase) {
            return this.bridge.send(data)
        }


        async init() {


        }


        async register(func:Function) {
            

        }

        checkConnectStatus(){
            return true;
        }




}