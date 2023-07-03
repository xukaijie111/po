

import {
    Compilation
} from '../Compilation'
import { ScriptModule } from '../modules'

import rollup from 'rollup'

import ts from 'rollup-plugin-typescript2'

import resolve from '@rollup/plugin-node-resolve'

import alias from '@rollup/plugin-alias'

import {
    RUNTIME_JSCORE_NPM,
    JSCORE_APP_NAME,
    JSCORE_PAGE_NAME,
    JSCORE_COMPONENT_NAME
} from '@po/shared'

import {
    readFileSync,
    walkNode,
    getAst,
    generateCodeByAst,
    getRelativePath
} from '@po/cjs-utils'

import {
    NodePath
} from '@babel/core'


import template from '@babel/template'

import {
    Plugin,
    InputOptions,
    OutputOptions
} from 'rollup'

import _ from "lodash"
export class JsCoreBuild {
    files: Set<ScriptModule>
    componentFiles: Set<string>
    appFile: string
    constructor(private compilation: Compilation) {
        this.files = new Set();
        this.componentFiles = new Set();
        this.loadFiles();

    }

    async run() {

        let inputOptions: InputOptions = {
            input: this.appFile,
            plugins: this.getPlugins(),

        }

        let outputOptions: OutputOptions = {
            file: this.getJsCoreDist(),
            format: "cjs"
        }

        const bundle = await rollup.rollup(inputOptions);
        await bundle.write(outputOptions);

    }


    getLastImportPath(path): NodePath {

        let lastPath = path
            .get('body')
            .filter((p) => p.isImportDeclaration())
            .pop();

        return lastPath || path
    }


    getModuleByDistFile(file:string) {

        let modules = this.compilation.getModules().values();

        for (let module of modules) {

            if (module.dist === file) return module
        }
    }

    handleAppFile() {
        let entryFile = this.appFile
        let componentFiles = this.componentFiles
        let code = readFileSync(entryFile)

        let ast = getAst(code);

        walkNode(ast, {

            Program: {
                enter: (path: NodePath) => {


                    let appImportNode = template(`import { ${JSCORE_APP_NAME} ,container } from "${RUNTIME_JSCORE_NPM}";`, { sourceType: 'module' })

                    let exportContainerNode = template(`export { container }`)
                    //@ts-ignore
                    path.unshiftContainer("body", appImportNode());

                    //@ts-ignore
                    path.pushContainer('body', exportContainerNode())

    
                    componentFiles.forEach((file) => {

                        //@ts-ignore
                        let module = this.getModuleByDistFile(file)

                        let { shareInfo } = module
                        let rel = getRelativePath(entryFile, module.dist)

                        let lastPath = this.getLastImportPath(path)


                        const myImport = template(`import {  ${shareInfo.name} } from "${rel}";`, { sourceType: 'module' });

                        lastPath.insertAfter(myImport());

                    })

                }
            }
        })


        return generateCodeByAst(ast)

    }


    handleComponentFile(file: string) {

        let module = this.getModuleByDistFile(file)

        let code = readFileSync(file)
        let ast = getAst(code)

        //@ts-ignore
        let { shareInfo } = module;

        let { isPage, name, id, pathWidthProject } = shareInfo

        walkNode(ast, {

            Program: {
                enter: (path) => {

                    let componentOrPageName = shareInfo.isPage ? JSCORE_PAGE_NAME : JSCORE_COMPONENT_NAME

                    let componentImportNode = template(`import { ${componentOrPageName}} from "${RUNTIME_JSCORE_NPM}";`, { sourceType: 'module' })

                    path.unshiftContainer("body", componentImportNode());

                    let lastPath = this.getLastImportPath(path)


                    const registerTemplate = template(`${componentOrPageName}.register({
                    name:"${name}",
                    templateId:"${id}",
                    path:"${pathWidthProject}",
                    isPage:${isPage}
                        })`)

                    lastPath.insertAfter(registerTemplate());

                    const exportTemplate = template(`export const ${name} = {}`)
                    lastPath.insertAfter(exportTemplate());

                }
            }
        })


        return generateCodeByAst(ast)

    }


    getJsPlugin(): Plugin {
        let self = this;
        return {

            name: "handle-js",
            load(id) {
                if (id === self.appFile) {
                    return {
                        code: self.handleAppFile()
                    }
                }
                if (self.componentFiles.has(id)) {
                    return {
                        code: self.handleComponentFile(id)
                    }

                }

                return null

            }
        }
    }


    getPlugins() {

        let plugins = [
            this.getJsPlugin(),
            ts({
                check: false
            }),
            resolve({
                extensions: ['.ts', '.js'],

            }),
            alias(this.getAlias())
        ]

        return plugins
    }




    getAlias() {

        let { compilation } = this;

        let alias = compilation.getAlias() || {}

        let entries = []

        for (let key in alias) {
            entries.push({
                find: key,
                replacement: alias[key]
            })
        }

        return {
            entries
        }
    }



   

    getJsCoreDist() {
        return this.compilation.getJsCoreDistPath()

    }



    loadFiles() {
        this.loadAppFile();
        this.loadComponentFiles();

    }

    loadAppFile() {
        let { compilation } = this

        let appFile = compilation.getAppFile();
        let modules = compilation.getModules();

        let module = modules.get(appFile) as ScriptModule;

        this.files.add(module)
        this.appFile = module.dist;

    }


    loadComponentFiles() {

        let { compilation } = this;
        let modules = compilation.getModules().values();

        for (let module of modules) {

            if (module instanceof ScriptModule && module.isComponentFile) {
                this.files.add(module)
                //@ts-ignore
                this.componentFiles.add(module.dist)
            }
        }


        

    }
}