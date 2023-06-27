import bodyParser from 'body-parser';

import cookieParser from 'cookie-parser';
import express from 'express';

import corsMiddleware from "./middleware/cors.middleware"

import { IndexContoller } from './controller/index'


import {
    BridgeServerConnect
} from './bridge-connect/index'

let controllers = [
    IndexContoller
]

export class Application {

    public app: express.Application;
    options:Application.options
    constructor(options:Application.options) {
        this.options = options
        this.app = express();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.initBridgeConnect();

    }


    initBridgeConnect() {
        new BridgeServerConnect(this).init();
    }

    private initializeMiddlewares() {
        this.app.use(bodyParser.json());
        this.app.use(cookieParser());
        this.app.use(corsMiddleware);
    }


    private initializeControllers(controllers: any[]) {
        controllers.forEach((Controller) => {
            let c = new Controller(this);
            this.app.use('/', c.router);
        });
    }


    getJsCorePath() {
        return this.options.jsCorePath
    }

    getWebviewPath() {
        return this.options.webviewDir
    }

}


export namespace Application {

    export type options = {

        webviewDir: string,
        jsCorePath: string
    }
}