import { Base } from "./modules/base"

import {
    ScriptModule,
    JsonModule,
    StyleModule,
    TemplateModule
} from './modules/index'

import Path from "path"
import { getRelativePath, relativeId } from "@po/cjs-utils"
import { generateMixed, serialPageName } from "@po/shared"


const moduleMatches = {

    ".json": JsonModule,
    ".pxml": TemplateModule,
    ".ts": ScriptModule,
    ".js": ScriptModule,
    ".less": StyleModule

}

export const enum HOOKNAMES  {

    LOAD ="load",
    TRANSFORM ="transform",
    GENERATE ="generate",
    BEFOREEMIT ="beforeEmit",
   EMIT= "emit",
   AFTEREMIT = "afterEmit"
}

import {
    ComponentShareInfo
} from './helper'

import defaultPlugins from "./plugins/index"


export class Compilation {
    options: Compilation.options
    rootPath: string
    modules: Map<string, Base>
    shareMap:Map<string,ComponentShareInfo>
    hooks:Record<HOOKNAMES,any>
    rawDist:string
    draftDist:string
    constructor(options: Compilation.options) {
        this.options = options
        this.rawDist = this.options.dist;
        this.draftDist = `${this.rawDist}/draft`
        this.rootPath = options.rootPath || process.cwd()
        this.modules = new Map()
        this.shareMap = new Map()
        this.hooks = {
            [HOOKNAMES.LOAD]:[],
            [HOOKNAMES.TRANSFORM]:[],
            [HOOKNAMES.GENERATE]:[],
            [HOOKNAMES.BEFOREEMIT]:[],
            [HOOKNAMES.EMIT]:[],
            [HOOKNAMES.AFTEREMIT]:[]

        }

        this.initPlugins();

        this.loadEntries()
    }


    initPlugins() {

        defaultPlugins.forEach((Plugin) => {
            new Plugin(this).apply()

        })

    }


    registerHook(name:string,fn:Function) {
        this.hooks[name].push(fn)
    }

    async callModuleHook(name: string, module?: Base) {
        await module[name]();
    }


    async runModuleHook(name:string) {
        for (let module of this.modules.values()) {
            await this.runGlobalHook(name,module)
            await this.callModuleHook(name, module)
        }

    }

    async runGlobalHook(name:string,...args:any) {
        let { hooks } = this;
        let processes = hooks[name]
        for (let process of processes) {
            await process(...args)
        }
    }

    async run() {
        await this.runModuleHook(HOOKNAMES.LOAD);
        await this.runModuleHook(HOOKNAMES.TRANSFORM);
        await this.runModuleHook(HOOKNAMES.GENERATE);
        await this.runModuleHook(HOOKNAMES.BEFOREEMIT);
        await this.runModuleHook(HOOKNAMES.EMIT)
        await this.runGlobalHook(HOOKNAMES.AFTEREMIT)
    }

    addModule(module: Base) {
        this.modules.set(module.getSrc(), module)
    }

    hasModule(file: string) {
        return !!this.modules.get(file)
    }

    getModule(file: string) {
        return this.modules.get(file)
    }

    getModuleConstructor(file: string) {

        let { ext } = Path.parse(file)

        let cotor = moduleMatches[ext]

        if (!cotor) {
            throw new Error(`can not find match module for file ${relativeId(file, this.rootPath)}`)
        }

        return cotor
    }

    getFileDistPath(path: string) {
        let { rootPath,draftDist } = this
        return path.replace(rootPath, draftDist)

    }

    createModule(file: string) {
        if (this.hasModule(file)) return this.getModule(file)
        let Ctor = this.getModuleConstructor(file)
        let dist = this.getFileDistPath(file)
        let mod = new Ctor({
            dist,
            src: file,
            compilation: this
        })
        return mod;

    }

    loadEntries() {
        let { entries } = this.options
        entries.forEach((file) => {
            this.createModule(file)
        })

    }

    getAlias() {
        return this.options.alias
    }


    getDistRelativePath(src:string,target:string) {

        let srcModule = this.getModule(src)
        let targetModule = this.getModule(target)

        let { dist : srcDist } = srcModule

        let { dist: targetDist } = targetModule


        return getRelativePath(srcDist,targetDist)
    }


    getComponentShareInfo(src:string):ComponentShareInfo {

        let { dir , name } = Path.parse(src)
        let file = `${dir}/${name}`

        if (this.shareMap.has(file)) return this.shareMap.get(file)


        let id = generateMixed();

        let { rootPath } = this;

        let pathWidthProject = file.replace(`${rootPath}/`,'')

        let compName = serialPageName(pathWidthProject)

        return {
            name:compName,
            pathWidthProject,
            id
        }


    }
}


export namespace Compilation {

    export type options = {
        alias: Record<string, any>
        entries: string[]
        dist: string,
        rootPath?: string
    }
}