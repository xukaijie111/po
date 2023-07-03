import { Compilation, HOOKNAMES } from "../Compilation";

import {
    WebviewBuild
} from './webviewBuild'
export class GenerateWebviewPlugin {

    constructor(private compilation:Compilation) {

    }


    apply() {

        let { compilation } = this;

        compilation.registerHook(HOOKNAMES.AFTEREMIT,async () => {
            await new WebviewBuild({
                compilation:this.compilation,
                alias:[{
                    find:"@pages",
                    replacement:this.compilation.getWebviewExportPagesPath()
                }]
            }).run()
        })
    }
}