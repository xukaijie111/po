import { Base } from "./modules/base"

import {
    ScriptModule,
    JsonModule,
    StyleModule,
    TemplateModule
} from './modules/index'

import Path from "path"
import { getRelativePath, readFileSync, relativeId } from "@po/cjs-utils"
import { generateMixed, serialPageName } from "@po/shared"

import _ from "lodash"

import glob from 'glob'

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


export type ITargetPlatform = "node" | "android" | "ios"

export class Compilation {
    options: Compilation.options
    projectRootPath: string
    modules: Map<string, Base>
    shareMap:Map<string,ComponentShareInfo>
    hooks:Record<HOOKNAMES,any>
    rawDist:string
    draftDist:string
    webviewIndexDist:string
    webviewHtmlDist:string
    webviewDraftPagesDist:string
    webviewDraftIndexDist:string
    entries:Array<string>
    appFile:string
    constructor(options: Compilation.options) {
        options.projectRootPath = options.projectRootPath || process.cwd()
        this.options = options
        this.rawDist = this.options.dist;
        this.draftDist = `${this.rawDist}/draft`
        this.webviewDraftPagesDist = `${this.draftDist}/webviewPages.js`
        this.webviewDraftIndexDist  = `${this.draftDist}/webviewIndex.js`
        this.webviewIndexDist = `${this.rawDist}/webview/index.js`
        this.webviewHtmlDist = `${this.rawDist}/webview/index.html`
        this.projectRootPath = options.projectRootPath
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

    }

    getJsCoreDistPath() {
        return `${this.rawDist}/jsCore/index.js`
    }


    getWebviewHtmlDistPath() {
        return this.webviewHtmlDist
    }
    getWebViewDistPath() {
        return this.webviewIndexDist
    }


    getWebviewDraftIndexPath() {
        return this.webviewDraftIndexDist
    }

    getWebviewExportPagesPath(){
        return this.webviewDraftPagesDist
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
        await this.loadEntries();
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
            throw new Error(`can not find match module for file ${relativeId(file, this.projectRootPath)}`)
        }

        return cotor
    }

    getFileDistPath(path: string) {
        let { projectRootPath,draftDist } = this
        return path.replace(projectRootPath, draftDist)

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

    async loadEntries() {

        let { appJson , projectRootPath  } = this.options;

        let parsed

        let entries = [

        ];

        try {
            let code = readFileSync(appJson)
            parsed = JSON.parse(code)
        } catch (error) {
            throw new Error(error)
        }
        for (let page of parsed.pages)  {
            let files = await glob.sync(`${projectRootPath}/${page}.{t,j}s`);
            if (!files || !files.length) {
                throw new Error(`No Find Page ${page}`)
            }
            entries = entries.concat(files)
        }

        let appFile = await glob.sync(`${projectRootPath}/app.{t,j}s`)
        if (!appFile || !appFile.length) {
            throw new Error(`No Find app.{t,j}s`)
        }

        this.appFile = appFile[0]

        this.entries = entries.concat(appFile);

        this.entries.forEach((file) => {
            this.createModule(file)
        })

    }


    getTargetPlatform():ITargetPlatform {

        return this.options.targetPlatform;

    }


    getBabelPlugins() {

        let plugins = [];

        let {replacement } = this.options

        if (!_.isEmpty(replacement)) {
            plugins.push(["transform-define", {
                ...replacement
              }])
        }

        return plugins;
    }

    getAppFile() {
        return this.appFile
    }

    getModules() {
        return this.modules
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

        let { projectRootPath } = this;

        let pathWidthProject = file.replace(`${projectRootPath}/`,'')

        let compName = serialPageName(pathWidthProject)

        let shareInfo = {
            name:compName,
            pathWidthProject,
            id
        }

        this.shareMap.set(file,shareInfo)

        return shareInfo


    }


    isExternal(value:string) {
        let { externals } = this.options
        return externals && externals.includes(value)
    }

    getExternals() {
        return this.options.externals || []
    }
}


export namespace Compilation {

    export type options = {
        alias: Record<string, any>,
        replacement?:Record<string,any>
        appJson:string,
        dist: string,
        projectRootPath?: string
        targetPlatform?:ITargetPlatform,
        externals?:Array<string>
    }
}