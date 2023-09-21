import { Application } from "../app"


export type IJsCoreType = {

    container:Object
}


export class NodePlatform {

        jsCore :IJsCoreType
        app:Application

        constructor(app:Application) {
            this.app = app;
            
        }
        init() {
            let jsCorePath = this.app.getJsCorePath();
            this.jsCore = require(jsCorePath)
        }
}