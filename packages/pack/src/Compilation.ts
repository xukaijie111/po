
import {
    fileIsExist,
    throwError,
    readFileSync,
    relativeId
} from '@po/cjs-utils'

import {
    compileSfc,
    CompileResult,
    ResolveOptions
} from '@po/compiler'


export class Compilation {
    projectDir: string
    appJson: Record<string, any>
    projectConfig:Record<string, any>
    componentFiles:Map<string,CompileResult>
    dist:string
    constructor(options: Compilation.options) {
        this.projectDir = options.dir || process.cwd()
        this.dist = options.dist;
        this.componentFiles = new Map();
    }



    async run() {
        this.parseAppJson()
        this.parseProjectConfig();
        await this.parseFiles()
    }


    parseFiles() {
        this.parseComponents()
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

        let { appJson } = this
        let { pages = [] } = appJson
        for (let page of pages) {
            await  this.parseComponent(`${page}`)
        }
      
    }

    async parseComponent(file:string) {

        if (this.componentFiles.has(file)) return ;
        let res = await compileSfc(`${file}.pxml`, { resolve : { alias : {}}})
        
        this.componentFiles.set(file,res)

        let { components } = res.json

        for (let comp of components) {
            let { path } = comp;

            await this.parseComponent(path)
        }

    }



}


export namespace Compilation {

    export interface options extends ResolveOptions {
        dir?: string,
        dist:string
    }
}