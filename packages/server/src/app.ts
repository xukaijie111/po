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
const PORT = 3456

export class Application {

    public app: express.Application;
    options: Application.options
    constructor(options: Application.options) {
        this.options = options
        this.app = express();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.initBridgeConnect();

    }


    run() {
        this.listen()
    }



    public listen() {
        const server = this.app.listen(PORT, '0.0.0.0', function () {
            //@ts-ignore
            const host = server.address().address
            //@ts-ignore
            const port = server.address().port
            console.log("访问地址为 http://%s:%s", host, port)
        })
        // this.app.listen(PORT, () => {
        //   console.log(`App listening on the port ${PORT}`);
        // });
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
        return this.options.webviewPath
    }


    getSocketPort() {
        return 8080
    }

}


export namespace Application {

    export type options = {

        webviewPath: string,
        jsCorePath: string
    }
}