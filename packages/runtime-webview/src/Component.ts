

import {
    BaseComponent
} from '@po/runtime-base'


import type {
    ExposeComponentOptions
} from './Webview'

import {
    generateMixed
} from '@po/shared'

export class Component extends BaseComponent{

    parent:Component
    children:Array<Component>
    constructor(private options:ExposeComponentOptions,props:Record<string,any>){
        super()
        this.props = props
        this.id = generateMixed()

    }

    init() {

    }

    callLifeTimes(name: string): void {
        
    }


    callMethod(name: string): void {
        
    }


    amount(elm:Node,refElm:Node = null) {

    }


    addChildren(child:Component){
        this.children.push(child)
    }
}