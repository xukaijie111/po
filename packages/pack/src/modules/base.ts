import { Compilation } from "../Compilation"

import {
    getContext,
    isComponentFile
} from '@po/cjs-utils'

import resolve from "enhanced-resolve"

export class Base {
    dist:string
    src:string
    compilation:Compilation
    isComponentFile:boolean
    context:string
    resolver:resolve.ResolveFunction
    constructor(options:Base.options) {
        this.dist = options.dist;
        this.src = options.src;
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


    async beforeEmit() {

    }


    async emit() {


    }

    shouldBeGenerate() {
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