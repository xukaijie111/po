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

import {
    ComponentShareInfo
} from './helper'


export class Compilation {
    options: Compilation.options
    rootPath: string
    modules: Map<string, Base>
    shareMap:Map<string,ComponentShareInfo>
    constructor(options: Compilation.options) {
        this.options = options
        this.rootPath = options.rootPath || process.cwd()
        this.modules = new Map()
        this.shareMap = new Map()

        this.loadEntries()
    }


    async callHook(name: string, module?: Base) {
        await module[name]();
    }


    async runHook(name:string) {

        for (let module of this.modules.values()) {
            await this.callHook(name, module)
        }

    }

    async run() {
        await this.runHook('load');
        await this.runHook('transform');
        await this.runHook('generate');
        await this.runHook('beforeEmit');
        await this.runHook('emit')
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
        let { rootPath } = this
        let { dist } = this.options

        return path.replace(rootPath, dist)

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