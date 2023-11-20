



import _ from "lodash"

import glob from 'glob'

import esbuild from 'esbuild'

import Path from "path"

import {
    Plugin
} from 'esbuild'

import {
    getJsonContent,
    readFileSync
} from "@po/cjs-utils"


export type IPackJsCoreOptions = {
    projectPath:string,
    dist:string,
    externals:Array<string>
    alias?:Record<string,string>
}


export class PackJsCore {
    options:IPackJsCoreOptions
    appFilePath:string
    appJsonPath:string
    componentFiles:Array<string>
    constructor(options:IPackJsCoreOptions) {
        this.options = options;
    }

    async start() {
        this.parseFiles();
        this.startBuild();
    }

    async parseFiles() {
        await this.parseApp();
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


    async parseComponentFiles() {

        let { appJsonPath,options,componentFiles } = this;
        let { projectPath } = options;

        let parsed = getJsonContent(appJsonPath);

        let pages = parsed.pages || []
        if (!pages.length) {
            throw new Error(`No Pages register in app.json`)
        }

       for (let page of pages) {
            let pagePath = await glob.sync(`${projectPath}/${page}.{t,j}s`)

            if (!pagePath || !pagePath.length) {
                throw new Error(`No Find page ${page} in app.json`)
            }

            if (componentFiles.includes(pagePath[0])) {
                throw new Error(`dulpicate register page ${page} in app.json`)
            }

           this.parseComponentFile(pagePath[0])
       }

    }



    async startBuild() {

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
                        ...this.options.externals
                    ]
                   
                })
        } catch (err) {
            console.log(err)
            throw new Error(err)
        }

    }


    getJsCoreDist() {

        return `${this.options.dist}/jsCore`
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
                build.onLoad({ filter: /\.(j|t)s$/ }, (args) => {

                    let { path } = args;
                    let code = readFileSync(path)

                    if (path === this.appFilePath) {
                        code = this.handleAppFile()
                    } else if (this.componentFiles.includes(path)) {
                        code = this.processComponentFile(path)
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


    processComponentFile(path) {


    }
    

}