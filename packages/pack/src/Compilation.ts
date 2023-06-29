import { Base } from "./modules/base"

import {
    ScriptModule,
    JsonModule,
    StyleModule,
    TemplateModule
} from './modules/index'

import Path from "path"
import { relativeId } from "@po/cjs-utils"


const moduleMatches = {

    ".json": JsonModule,
    ".pxml": TemplateModule,
    ".ts": ScriptModule,
    ".js": ScriptModule,
    ".less": StyleModule

}


export class Compilation {
    options: Compilation.options
    rootPath: string
    modules: Map<string, Base>
    constructor(options: Compilation.options) {
        this.options = options
        this.rootPath = options.rootPath || process.cwd()
        this.modules = new Map()

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
}


export namespace Compilation {

    export type options = {
        alias: Record<string, any>
        entries: string[]
        dist: string,
        rootPath?: string
    }
}