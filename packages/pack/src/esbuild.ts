
import esbuild from 'esbuild'

import {
    Plugin
} from 'esbuild'

import {
    readFileSync,
    getAst,
    walkNode,
    getRelativePath,
    generateCodeByAst,
    ignoreExt
} from '@po/cjs-utils'

import {
    RUNTIME_JSCORE_NPM,
    JSCORE_APP_NAME,
    JSCORE_PAGE_NAME,
    JSCORE_COMPONENT_NAME
} from '@po/shared'

import template from '@babel/template'

import {
    NodePath
} from '@babel/core'




export class EsbuildCompiler {


    constructor(private options: EsbuildCompiler.options) {

    }



    async run() {
        try {
            await esbuild
                .build({
                    entryPoints: [this.options.entry],
                    outfile: this.options.dist,
                    bundle: true,
                    format: "cjs",
                    platform: "node",
                    alias: this.options.alias || {},
                    plugins: this.getPlugins(),
                    external: [
                        RUNTIME_JSCORE_NPM
                    ]
                })
        } catch (err) {
            console.log(err)
            throw new Error(err)
        }

    }

    getLastImportPath(path): NodePath {

        let lastPath = path
            .get('body')
            .filter((p) => p.isImportDeclaration())
            .pop();

        return lastPath || path
    }

    handleAppFile() {
        let entryFile = this.options.entry;
        let componentFiles = this.options.componentFiles
        let code = readFileSync(entryFile)

        let ast = getAst(code);

        walkNode(ast, {

            Program: {
                enter: (path: NodePath) => {


                    let appImportNode = template(`import { ${JSCORE_APP_NAME}} from "${RUNTIME_JSCORE_NPM}";`, { sourceType: 'module' })

                    //@ts-ignore
                    path.unshiftContainer("body", appImportNode());

                    componentFiles.forEach((res) => {

                        let { file, compileResult } = res;
                        let { name } = compileResult
                        let rel = getRelativePath(entryFile, file)

                        let lastPath = this.getLastImportPath(path)


                        const myImport = template(`import {  ${name} } from "${rel}";`, { sourceType: 'module' });

                        lastPath.insertAfter(myImport());

                    })

                }
            }
        })

        return generateCodeByAst(ast)

    }


    handleComponentFile(file:string) {

        let detail = this.options.componentFiles.get(ignoreExt(file))

        let { compileResult } = detail

        let { name, pathWithProject, id } = compileResult

        let { isPage } = compileResult

        let code = readFileSync(file)
        let ast = getAst(code)

        walkNode(ast, {

            Program: {
                enter: (path) => {

                    let componentOrPageName = isPage ? JSCORE_PAGE_NAME : JSCORE_COMPONENT_NAME

                    let componentImportNode = template(`import { ${componentOrPageName}} from "${RUNTIME_JSCORE_NPM}";`, { sourceType: 'module' })

                    path.unshiftContainer("body", componentImportNode());

                    let lastPath = this.getLastImportPath(path)


                    const registerTemplate = template(`${componentOrPageName}.register({
                    name:"${name}",
                    templateId:"${id}",
                    path:"${pathWithProject}",
                    isPage:${isPage}
                        })`)

                    lastPath.insertAfter(registerTemplate());

                    const exportTemplate = template(`export const ${name} = {}`)
                    lastPath.insertAfter(exportTemplate());

                }
            }
        })

        console.log(`code is `,generateCodeByAst(ast))

        return generateCodeByAst(ast)

    }

    getAppJsPlugin(): Plugin {

        return {

            name: "Entry",
            setup: (build) => {
                build.onLoad({ filter: /\.(j|t)s$/ }, (args) => {

                    let { path } = args;
                    let code = readFileSync(path)

                    if (path === this.options.entry) {
                        code = this.handleAppFile()
                    } else if (this.options.componentFiles.has(ignoreExt(path))) {
                        code = this.handleComponentFile(path)
                    }

                    return {
                        contents: code,
                        loader: "js"
                    }

                })
            }
        }
    }

    getPlugins() {

        let plugins = []
        plugins.push(this.getAppJsPlugin())

        return plugins
    }
}


export namespace EsbuildCompiler {

    export type options = {

        entry: string,
        componentFiles: Map<string, Record<any, any>>,
        dist: string,
        alias?: Record<any, any>
    }
}