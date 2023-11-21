



import _ from "lodash"

import glob from 'glob'

import esbuild from 'esbuild'


import {
    Plugin
} from 'esbuild'

import {
    getJsonContent,
} from "@po/cjs-utils"
import { Component } from "./Component"

import {
    EsbuildProcessAppFilePlugin
} from "./plugins/esbuildProcessAppFilePlugin"

import {
    EsbuildProcessComponentScriptPlugin
} from "./plugins/esbuildProcessComponentScriptPlugin"

export type IPackJsCoreOptions = {
    projectPath:string,
    dist:string,
    externals:Array<string>
    alias?:Record<string,string>
    platform:"node" | "android" | "ios"
}


export class PackJsCore {
    options:IPackJsCoreOptions
    appFilePath:string
    appJsonPath:string
    components:Map<string,Component> = new Map()

    plugins:any[]
    constructor(options:IPackJsCoreOptions) {
        this.options = options;
       
    }

    async start() {
        await this.parseFiles();
        this.startBuild();
    }

    async parseFiles() {
        await this.parseApp();

        await this.parseComponentFiles();
    }


    async parseApp() {
        let { options } = this;

        let { projectPath } = options

        let appFile = await glob.sync(`${projectPath}/app.{t,j}s`)
        if (!appFile || !appFile.length) {
            throw new Error(`No Find app.{t,j}s`)
        }
        this.appFilePath = appFile[0]

        let appJson = await glob.sync(`${projectPath}/app.json`)

        if (!appJson || !appJson.length) {
            throw new Error(`No Find app.json`)
        }
        this.appJsonPath = appJson[0]

    }


    getAppFile() {
        return this.appFilePath
    }
    getAlias() {
        return this.options.alias
    }

    getProjectPath(){
        return this.options.projectPath
    }
    async parseComponentFiles() {

        let { appJsonPath,options, } = this;
        let { projectPath } = options
        let parsed = getJsonContent(appJsonPath);
        let pages = parsed.pages || []
        if (!pages.length) {
            throw new Error(`No Pages register in app.json`)
        }

       for (let page of pages) {
            await this.parseComponent(`${projectPath}/${page}`)
       }    

    }


    async parseComponent(baseFile:string) {

        let { components } = this;
        let component = new Component({
            basePath:baseFile,
            compilation:this
        })
        await component.parseFiles();

        components.set(component.id,component)
        let jsonResult = component.getJsonResult();

        for (let dep of jsonResult.components) {
                await this.parseComponent(dep.path);
        }

    }



    async startBuild() {

        this.plugins = [
            new EsbuildProcessAppFilePlugin(this),
            new EsbuildProcessComponentScriptPlugin(this)
        ]


        try {
            await esbuild
                .build({
                    entryPoints: [this.appFilePath],
                    outfile:this.getJsCoreDist(),
                    bundle: true,
                    format: "cjs",
                    platform: "node",
                    alias: this.options.alias,
                    plugins: this.getPlugins(),
                    treeShaking:false,
                    external:[
                        ...this.options.externals || []
                    ]
                   
                })
        } catch (err) {
            console.log(err)
            throw new Error(err)
        }

    }


    getJsCoreDist() {

        return `${this.options.dist}/jsCore/index.js`
    }

    getPlugins() {

       
        let plugins = []
        plugins.push(this.getJsPlugin())

        return plugins
    }


    getJsPlugin(): Plugin {

        return {
            name: "Entry",
            setup: (build) => {
                this.plugins.forEach((plugin) => {
                    build.onLoad({ filter: plugin.filter},(args) => {
                        return plugin.process(args)
                    })
                })
            }
        }
    }


    getTargetPlatform():string {

        return this.options.platform;

    }

}