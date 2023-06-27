
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
    PACK_APPSERVICE_NAME
} from '@po/shared'

import glob from 'glob'


export class Compilation {
    projectDir: string
    appJson: Record<string, any>
    projectConfig:Record<string, any>
    componentFiles:Map<string,Record<any,any>>
    dist:string
    webviewDist:string
    jsCoreDist:string
    pageExportFile:string
    options:Compilation.options
    constructor( options: Compilation.options) {
        this.options = options
        this.projectDir = options.dir || process.cwd()
        this.dist = options.dist;
        this.webviewDist = `${this.dist}/webview`
        this.pageExportFile = `${this.dist}/webview/pages.js`
        this.jsCoreDist = `${this.dist}/jscore`
        this.componentFiles = new Map();
    }



    async run() {
        this.parseAppJson()
        this.parseProjectConfig();
        await this.parseComponents()
        this.emitFiles()

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
        await this.emitJsCoreFiles();

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

        this.addWebviewPageEntry();
    }


    addWebviewPageEntry() {
        
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
        
            export default  pages =  {
                ${names.join(',')}
            }
        
        `

        emitFile(pageExportFile,entryCode)
        
    }


    getDistPath(distPath:string,file:string) {

        let { projectDir } = this;

        let relPath = file.replace(projectDir,'')

        return `${distPath}/${relPath}`


    }


    async emitJsCoreFiles() {


        let { projectDir,dist  } = this;
        
        let appJsPath = `${projectDir}/app.js`

        let appTsPath = `${projectDir}/app.ts`

        if (!fileIsExist(appJsPath) && !fileIsExist(appTsPath)) {
            throwError(`app.(j/t)s without`)
        }

        let appScriptPath = appJsPath || appTsPath

        let jsDist = `${dist}/jsCore/${PACK_APPSERVICE_NAME}.js`
       

        let  jsCompiler = new JsCoreCompiler({
            dist:jsDist,
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