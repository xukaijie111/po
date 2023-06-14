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

    constructor() {

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

}


export namespace Application {

    export type options = {

        webviewDir:string,
        jsCoreDir:string
    }
}