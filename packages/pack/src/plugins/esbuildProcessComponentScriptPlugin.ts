
import { PackJsCore } from "..";


import esbuild from "esbuild"
import { readFileSync } from "@po/cjs-utils";

import Path from "path"


export class EsbuildProcessComponentScriptPlugin {




    compilation: PackJsCore
    filter: RegExp
    constructor(compilation: PackJsCore) {
        this.compilation = compilation

        this.filter = /\.(t|j)s/
    }



    process(args: esbuild.OnLoadArgs) { 

        let { path } = args

        let componentScripts = Array.from(this.compilation.components.values())
                                    .map((component) => component.scriptFilePath)


        let code = readFileSync(path)

        if (componentScripts.includes(path)) {
            code = this.processComponentScript(path)
        }

        return {
            contents:code,
            loader: "ts"
        }
    }


    processComponentScript(file:string) {

        let { dir,name} = Path.parse(file)

        let component = this.compilation.components.get(`${dir}/${name}`);
        return component.generateScriptCode();

    }

}