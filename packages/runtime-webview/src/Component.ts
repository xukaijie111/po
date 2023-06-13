

import {
    BaseComponent
} from '@po/runtime-base'


import type {
    ExposeComponentOptions
} from './Webview'

export class Component extends BaseComponent{

    
    constructor(private options:ExposeComponentOptions,props:Record<string,any>){
        super()
        this.props = props

    }

    init() {

    }

    callLifeTimes(name: string): void {
        
    }


    callMethod(name: string): void {
        
    }
}