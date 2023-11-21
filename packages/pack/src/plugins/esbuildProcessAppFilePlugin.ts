import { PackJsCore } from "..";


import esbuild from 'esbuild'

import {
    readFileSync,
    walkNode,
    getAst,
    getRelativePath,
    generateCodeByAst
} from "@po/cjs-utils"

import {
    NodePath
} from '@babel/core'


import {
    JSCORE_APP_NAME,
    RUNTIME_JSCORE_NPM
} from "@po/shared"


import template from '@babel/template'
import { Node } from "../node";


export class EsbuildProcessAppFilePlugin  extends Node{


    compilation: PackJsCore
    filter: RegExp
    constructor(compilation: PackJsCore) {
        super();
        this.compilation = compilation

        this.filter = new RegExp(compilation.getAppFile())

    }



    process(args: esbuild.OnLoadArgs) {

        let { path:appFilePath } = args

        let code = readFileSync(appFilePath)

        let ast = getAst(code);

        let { components } = this.compilation

        walkNode(ast, {

            Program: {
                enter: (path: NodePath) => {


                    let appImportNode = template(`import { cmd  } from "${RUNTIME_JSCORE_NPM}";`, { sourceType: 'module' })

                    //@ts-ignore
                    path.unshiftContainer("body", appImportNode());

                    // node平台下，导出
                    //@ts-ignore
                    if (this.compilation.getTargetPlatform() === "node") {
                        let exportContainerNode = template(`export { cmd  }`);
                        //@ts-ignore
                        path.pushContainer('body', exportContainerNode())
                    }

                    // 单输入才能单输出
                    //@ts-ignore

                    Array.from(components.values())
                        .filter((component) => component.isPage())
                        .forEach((component) => {

                        let rel = getRelativePath(appFilePath, component.scriptFilePath)

                        let lastPath = this.getLastImportPath(path)


                        const myImport = template(`import  "${rel}";`, { sourceType: 'module' });

                        lastPath.insertAfter(myImport());

                    })

                }
            }
        })

        return {
            contents: generateCodeByAst(ast),
            loader: "ts"
        }

    }
}