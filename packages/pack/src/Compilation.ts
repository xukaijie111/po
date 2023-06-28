
import {
    fileIsExist,
    throwError,
    readFileSync,
    relativeId,
    emitFile,
    getRelativePath,
    
} from '@po/cjs-utils'

import {
    compileSfc,
    ResolveOptions
} from '@po/compiler'


import {
    JsCoreCompiler 
} from './jsBuild'

import {
    WebviewCompile
} from './webviewBuild'


import {
    PACK_APPSERVICE_NAME
} from '@po/shared'

import glob from 'glob'


export class Compilation {
    projectDir: string
    appJson: Record<string, any>
    projectConfig:Record<string, any>
    componentFiles:Map<string,Record<any,any>>
    dist:string
    finalyWebviewDist:string
    webviewDist:string
    webviewDistIndex:string
    jsCoreDist:string
    pageExportFile:string
    
    options:Compilation.options
    constructor( options: Compilation.options) {
        this.options = options
        this.projectDir = options.dir || process.cwd()
        this.dist = options.dist;
        this.finalyWebviewDist = `${this.dist}/webview/index.js`
        this.webviewDist = `${this.dist}/webviewdraft`
        this.webviewDistIndex = `${this.webviewDist}/index.js`
        this.pageExportFile = `${this.webviewDist}/pages.js`
        this.jsCoreDist = `${this.dist}/jscore/${PACK_APPSERVICE_NAME}.js`
        this.componentFiles = new Map();
    }



    getWebviewDistPath(){
        return this.finalyWebviewDist;
    }


    getJsCoreDistPath () {
        return this.jsCoreDist
    }


    async run() {
        this.parseAppJson()
        this.parseProjectConfig();
        await this.parseComponents()
        await this.emitFiles()

    }


    getPathOppositeProject(path:string) {

        return path.replace(`${this.projectDir}/`,'')
    }


    _parseJson(file: string) {
        if (!fileIsExist(file)) {
            throwError(`File ${relativeId(file)} no exsit`)
        }
        let content = readFileSync(file)

        return JSON.parse(content)
    }


    parseAppJson() {
        let file = `${this.projectDir}/app.json`

        this.appJson = this._parseJson(file)

    }


    parseProjectConfig() {

        let file = `${this.projectDir}/project.config.json`
        this.projectConfig = this._parseJson(file)
        if (!this.projectConfig.resolve) {
            this.projectConfig.resolve = {}
        }
    }


    async parseComponents() {

        let { appJson,projectDir } = this
        let { pages = [] } = appJson
        for (let page of pages) {
            await  this.parseComponent(`${projectDir}/${page}`)
        }
      
    }

    async parseComponent(file:string) {

        if (this.componentFiles.has(file)) return ;
    
        let res = await compileSfc(file, {
            pathWithProject:this.getPathOppositeProject(file),
             resolve : { alias : {}}
            })
        
        this.componentFiles.set(file,{
            compileResult:res
        })

        let { components } = res.json

        for (let comp of components) {
            let { path } = comp;

            await this.parseComponent(path)
        }

    }


    async emitFiles() {
        
        this.emitWebviewFiles();
        await this.buildWebview();
        await this.emitJsCoreFiles();

    }


    async buildWebview() {

        let compiler = new WebviewCompile({
            compilation:this,
            entry:this.webviewDistIndex,
            dist:this.finalyWebviewDist,
            alias:[{
                find:"@pages",
                replacement:this.pageExportFile
            }]
        })

        await compiler.run();
    }

    emitWebviewFiles() {

        let { componentFiles,webviewDist } = this;

        componentFiles.forEach((res,file) => {
            let { code } = res.compileResult;
            let fileDistPath = this.getDistPath(webviewDist, file);
            fileDistPath = `${fileDistPath}.js`
            res.dist = fileDistPath;
            res.file = glob.sync(`${file}.{j,t}s`)[0]
            if (!res.file) {
                throwError(`component/page ${relativeId(file)} no find`)

            }
            emitFile(`${fileDistPath}`, code);
       
        })

        this.addWebviewPages();
        this.addWebviewIndex();
    }


    addWebviewIndex() {

        let code = `
            import { Webview } from "@po/runtime-webview"
            import pages from "./pages"
            new Webview(pages)
        `

        emitFile(this.webviewDistIndex,code)

    }

    addWebviewPages() {
        
        let { pageExportFile,appJson,projectDir } = this;
        let names = [
        ]
        let entryCode = ``

        this.componentFiles.forEach((res,file) => {
            let { compileResult , dist } = res

            let { isPage ,name  }  = compileResult
            if (!isPage) return ;

            if (!appJson.pages?.includes(file.replace(`${projectDir}/`,''))) {
                throwError(`page ${relativeId(file)} no defined in app.json pages field`)
            }

            let rel = getRelativePath(pageExportFile,dist)

            entryCode += `
                import { ${name} } from "${rel}"; \n
            `
            names.push(name)
            
        })

        entryCode += `

           const pages =  {
                ${names.join(',')}
            };

            export default pages;
        
        `

        emitFile(pageExportFile,entryCode)
        
    }


    getDistPath(distPath:string,file:string) {

        let { projectDir } = this;

        let relPath = file.replace(projectDir,'')

        return `${distPath}/${relPath}`


    }


    async emitJsCoreFiles() {


        let { projectDir  } = this;
        
        let appJsPath = `${projectDir}/app.js`

        let appTsPath = `${projectDir}/app.ts`

        if (!fileIsExist(appJsPath) && !fileIsExist(appTsPath)) {
            throwError(`app.(j/t)s without`)
        }

        let appScriptPath = appJsPath || appTsPath

      
       

        let  jsCompiler = new JsCoreCompiler({
            dist:this.jsCoreDist,
            alias:this.getAlias(),
            entry:appScriptPath,
            componentFiles:this.componentFiles,
            compilation:this
        })

        await jsCompiler.run();

    }

    getAlias() {
        return this.projectConfig.resolve?.alias
    }


   


}


export namespace Compilation {

    export interface options extends ResolveOptions {
        dir?: string,
        dist:string,
        alias?:Record<string,any>
    }
}