import { Application } from "../app";


import {
    Container
} from '@po/runtime-jscore'
import {
    Socket
} from "./socket"

import {
    PROTOCOL_CMD
} from '@po/shared'

import {
    Webview
} from './webview'

export type JsCoreExport = {
    container:Container
}

export class BridgeServerConnect {

    app:Application
    socket:Socket
    jsCore:JsCoreExport
    constructor(app:Application) {
        this.app = app;
    }

    init() {
        this.requireJsCore();
        this.initBridge();

    }


    initBridge() {
        this.socket = new Socket({
            port:this.app.getSocketPort()
        })
        this.socket.addConnectedHook(this.addNewWebview)
        this.socket.start()
    }

    addNewWebview = (ws) => {
        new Webview({
            ws,
            bridgeServerConnect:this
        })
    }

    requireJsCore() {
        let jsCorePath = this.app.getJsCorePath();
        this.jsCore = require(jsCorePath)
    }


    registerCallback(ws,type,func){
        let { socket } = this;
        socket.use(ws,type,func)
       
    }

}