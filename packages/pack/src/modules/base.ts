import { Compilation } from "../Compilation"

import {
    getContext,
    isComponentFile,
    emitFile,
    readFileSync
} from '@po/cjs-utils'

import {
    generateMixed
} from '@po/shared'

import resolve from "enhanced-resolve"

import {
    ComponentShareInfo
} from '../helper'


import prettier from "prettier";

export class Base {
    dist:string
    src:string
    compilation:Compilation
    isComponentFile:boolean
    context:string
    rawCode:string
    code:string
    id:string
    resolver:resolve.ResolveFunction
    shareInfo:ComponentShareInfo
    pretty = true
    constructor(options:Base.options) {
        this.dist = options.dist;
        this.src = options.src;
        this.code = this.rawCode = readFileSync(this.src)
        this.id = generateMixed();
        this.compilation = options.compilation
        this.isComponentFile = isComponentFile(this.src)
        this.context = getContext(this.src)
        this.compilation.addModule(this)
        this.init()
    }

    getSrc(){
        return this.src
    }

    init() {

       
    }


    async load() {


    }


    async transform() {


    }


    async generate(){
      

    }

    async beforeEmit() {

    }


    async emit() {
        if (this.shouldBeEmit()) {
            let code = this.code
            if (this.pretty)
                code = prettier.format(this.code, { semi: true, parser: "babel" })
            emitFile(this.dist,code)
        }
       
    }

    shouldBeEmit() {
        return true
    }
}


export namespace Base {
    export type options = {
        dist:string,
        src:string,
        compilation:Compilation
    }
}