import { Application } from "../app";


import {
    Container
} from '@po/runtime-jscore'
import {
    BridgeServer
} from "@po/bridge-server"

type JsCoreExport = {
    container:Container
}

export class BridgeServerConnect {

    app:Application
    bridge:BridgeServer
    jsCore:JsCoreExport
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
        let jsCorePath = this.app.getJsCorePath();
        this.jsCore = require(jsCorePath)
    }


    registerCallback(){

        let { bridge } = this;

       
    }

}