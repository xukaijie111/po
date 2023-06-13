

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
}