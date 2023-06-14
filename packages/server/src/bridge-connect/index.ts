import { Application } from "../app";

import {
    BridgeServer
} from "@po/bridge-server"

export class BridgeServerConnect {

    app:Application
    bridge:BridgeServer
    constructor(app:Application) {
        this.app = app;
    }

    init() {
        this.bridge = new BridgeServer({
            host:"loclhost",
            port:3000
        })

        this.requireJsCore();
        this.registerCallback()
    }

    requireJsCore() {
        
    }


    registerCallback(){

        
    }

}