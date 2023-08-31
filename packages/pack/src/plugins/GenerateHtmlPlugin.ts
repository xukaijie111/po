
import { Compilation, HOOKNAMES } from "../Compilation";

import {
    getRelativePath,
    emitFile
} from "@po/cjs-utils"



export class GenerateHtmlPlugin {


    constructor(private compilation: Compilation) {

    }

    apply() {

        let { compilation } = this;

        compilation.registerHook(HOOKNAMES.AFTEREMIT, async () => {
            this.createHtml();
   
        })
    }


    createHtml() {


        let webviewIndexDist = this.compilation.getWebViewDistPath();
        let webViewHtmlDist = this.compilation.getWebviewHtmlDistPath();

        let relPath = getRelativePath(webViewHtmlDist,webviewIndexDist);
    

        let code = ` <html>
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
            <script type = "module" src = "${relPath}">
            </script>
            </html>`

            emitFile(webViewHtmlDist,code)

    }
}