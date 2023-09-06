
import { Request, Response, NextFunction, Router } from 'express';
import { Application } from '../app';

import {
    readFileSync
} from '@po/cjs-utils'

export type ProcessResult = {
    code:string,
    type:string
}

export class JsCoreContoller {

    public path = "/jsCore";
    public router: Router = Router();
    app:Application

    constructor(application:Application) {
        this.app = application;
        this.initializeRoutes();
       
    }

    private initializeRoutes() {
        this.router.post(`${this.path}`, this.getJsCoreRouter)
    }


    getJsCoreRouter = async (request: Request, response: Response, next: NextFunction) => {
        console.log(`###request jscore request`);
        let jsCorePath = this.app.getJsCorePath();
        let code = readFileSync(jsCorePath);
        return response.json({ code });
    }
}