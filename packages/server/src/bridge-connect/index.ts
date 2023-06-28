import { Application } from "../app";


import {
    Container
} from '@po/runtime-jscore'
import {
    Socket
} from "./socket"

type JsCoreExport = {
    container:Container
}

export class BridgeServerConnect {

    app:Application
    bridge:Socket
    jsCore:JsCoreExport
    constructor(app:Application) {
        this.app = app;
    }

    init() {
        this.initBridge();
        this.requireJsCore();
        this.registerCallback()
    }


    initBridge() {
        this.bridge = new Socket({
            port:this.app.getSocketPort()
        })
        this.bridge.start()
    }

    requireJsCore() {
        let jsCorePath = this.app.getJsCorePath();
        this.jsCore = require(jsCorePath)
    }


    registerCallback(){

        let { bridge } = this;

       
    }

}