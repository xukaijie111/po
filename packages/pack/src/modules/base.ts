import { Compilation } from "../Compilation"


import resolve from "enhanced-resolve"

export class Base {
    dist:string
    src:string
    compilation:Compilation
    resolver:resolve.ResolveFunction
    constructor(options:Base.options) {
        this.dist = options.dist;
        this.src = options.src;
        this.compilation = options.compilation
        this.compilation.addModule(this)
        this.init()
    }

    getSrc(){
        return this.src
    }

    init() {

    }

    analyze() {


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