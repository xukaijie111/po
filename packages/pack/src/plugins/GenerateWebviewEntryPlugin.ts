
import { Compilation, HOOKNAMES } from "../Compilation";
import { TemplateModule } from "../modules";

import {
    emitFile,
    getRelativePath
} from '@po/cjs-utils'

export class GenerateWebviewEntryPlugin {


    constructor(private compilation: Compilation) {

    }

    apply() {

        let { compilation } = this;

        compilation.registerHook(HOOKNAMES.AFTEREMIT, async () => {


            this.createWbviewPages();
            this.createWebviewIndex();
        })
    }


    createWbviewPages() {

        let pageExportFile = this.compilation.getWebviewExportPagesPath();
        let modules = this.compilation.getModules().values();


        let names = [
        ]
        let entryCode = ``

        for (let module of modules) {

            if (module instanceof TemplateModule && module.isComponentFile) {

                let { shareInfo, dist } = module;

                let { name } = shareInfo;

                let rel = getRelativePath(pageExportFile, dist)

                entryCode += `
                import  ${name}  from "${rel}"; \n
            `
                names.push(name)

            }
        }



        entryCode += `

           const pages =  {
                ${names.join(',')}
            };

            export default pages;
        
        `

        emitFile(pageExportFile, entryCode)

    }



    createWebviewIndex() {
        let dist = this.compilation.getWebviewDraftIndexPath();
        let rel = getRelativePath(dist, this.compilation.getWebviewExportPagesPath())
        let code = `
        import { Webview } from "@po/runtime-webview"
        import pages from "${rel}"
        new Webview(pages)
    `

        emitFile(dist, code)

    }
}