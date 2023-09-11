

import {
    Compilation
} from '../Compilation'
import { ScriptModule } from '../modules'


import {
    RUNTIME_JSCORE_NPM,
    JSCORE_APP_NAME,
    JSCORE_PAGE_NAME,
    JSCORE_COMPONENT_NAME,
    
} from '@po/shared'

import {
    readFileSync,
    walkNode,
    getAst,
    generateCodeByAst,
    getRelativePath,
    
} from '@po/cjs-utils'

import {
    NodePath
} from '@babel/core'


import template from '@babel/template'



import esbuild from 'esbuild'

import {
    Plugin
} from 'esbuild'

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

        console.log(`#####externl is `,this.compilation.getExternals())

        try {
            await esbuild
                .build({
                    entryPoints: [this.appFile],
                    outfile:this.getJsCoreDist(),
                    bundle: true,
                    format: "cjs",
                    platform: "node",
                    alias: this.getAlias(),
                    plugins: this.getPlugins(),
                    treeShaking:false,
                    external:[
                        ...this.compilation.getExternals()
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

        let ast = getAst(code,this.compilation.getBabelPlugins());

        walkNode(ast, {

            Program: {
                enter: (path: NodePath) => {


                    let appImportNode = template(`import { ${JSCORE_APP_NAME} ,container  } from "${RUNTIME_JSCORE_NPM}";`, { sourceType: 'module' })

                  //  let exportContainerNode = template(`export { container , ${NATIVECALLJSFUNCNAME} }`)
                    //@ts-ignore
                    path.unshiftContainer("body", appImportNode());

                    // node平台下，导出
                    //@ts-ignore
                    if (this.compilation.getTargetPlatform() === "node") {
                        let exportContainerNode = template(`export { container  }`);
                        //@ts-ignore
                        path.pushContainer('body', exportContainerNode())
                    }

                    // 单输入才能单输出
                    //@ts-ignore
  
                    componentFiles.forEach((file) => {

                        //@ts-ignore
                        let module = this.getModuleByDistFile(file)

                        let rel = getRelativePath(entryFile, module.dist)

                        let lastPath = this.getLastImportPath(path)


                        const myImport = template(`import  "${rel}";`, { sourceType: 'module' });

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
        let ast = getAst(code,this.compilation.getBabelPlugins())

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

                }
            }
        })


        return generateCodeByAst(ast)

    }

    getJsPlugin(): Plugin {

        return {

            name: "Entry",
            setup: (build) => {
                build.onLoad({ filter: /\.(j|t)s$/ }, (args) => {

                    let { path } = args;
                    let code = readFileSync(path)

                    if (path === this.appFile) {
                        code = this.handleAppFile()
                    } else if (this.componentFiles.has(path)) {
                        code = this.handleComponentFile(path)
                    }else {
                        code = this.handleOtherFile(path) // babel plugin
                    }

                    return {
                        contents: code,
                        loader: "ts"
                    }

                });

                build.onEnd(() => {
                    
                    

                })
            }
        }
    }




    handleOtherFile(path) {

        let code = readFileSync(path)

        let ast = getAst(code,this.compilation.getBabelPlugins())

        code = generateCodeByAst(ast);

        return code;

    }
    


    getPlugins() {

       
        let plugins = []
        plugins.push(this.getJsPlugin())

        return plugins
    }




    getAlias() {

        let { compilation } = this;
        return  compilation.getAlias() || {}
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