
import { Request, Response, NextFunction, Router } from 'express';
import { Application } from '../app';



export type ProcessResult = {
    code:string,
    type:string
}

export class IndexContoller {

    public path = "/";
    public router: Router = Router();
    app:Application

    resolver
    constructor(application:Application) {
        this.app = application;
        this.initializeRoutes();
       
    }

    private initializeRoutes() {
        this.router.get(`${this.path}`, this.getIndexRouter)


    }


    getIndexRouter = async (request: Request, response: Response, next: NextFunction) => {

        let body = `
                <html>
                <head>
                <meta http-equiv="Expires" content="0">
                <meta http-equiv="Pragma" content="no-cache">
                <meta http-equiv="Cache-Control" content="no-cache">
                <meta http-equiv="Cache" content="no-cache">
                <meta name="viewport" content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=0">

                <style>

                    body{
                        margin:0px
                    }
                </style>
                </head>
                
                <body>
                    <div id="app">
              
                    </div>
                    </script>
                </body>
                <script type="module" src = "webview"></script>
                </html>`

        response.set("Content-Type", "text/html");
        response.send(body)

        return;
    }
}