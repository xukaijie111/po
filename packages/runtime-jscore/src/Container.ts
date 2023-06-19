


import {
    CompilerComponentOptions
} from '@po/shared'
import { ComponentInstance } from './Component';

import { PageInstance } from './Page'

import {
    INIT_COMPONENT_DATA
} from '@po/bridge-server'


import {
    ComponentOptions
} from './expose'

export type CompotionsMap = Map<
    CompilerComponentOptions,
    {
        options: ComponentOptions,
        list: Set<ComponentInstance | PageInstance>
    }
>

export class Container {


    componentsMap: CompotionsMap
    currentComponentOptions: CompilerComponentOptions | null

    constructor() {
        this.currentComponentOptions = null;
        this.componentsMap = new Map();

    }


    register(options: CompilerComponentOptions) {

        if (this.currentComponentOptions) {
            throw new Error(`path ${this.currentComponentOptions.path} has no Component/Page Register`)
        }
        this.currentComponentOptions = options
    }

    addComponent(options: ComponentOptions) {
        let { currentComponentOptions } = this;

        if (!currentComponentOptions) {
            throw new Error(`has no Component/Page Register`)
        }

        this.componentsMap.set(currentComponentOptions, {
            options,
            list: new Set()
        })


    }



    createComponent(options: INIT_COMPONENT_DATA) {

        let { templateId } = options

        let { componentsMap } = this;

        let keys = Array.from(componentsMap.keys());

        for (let i = 0; i < keys.length;i++) {
            let compilerOptions = keys[i];
            if (compilerOptions.templateId === templateId) {
                    let res = componentsMap.get(compilerOptions)
                    let { isPage } = compilerOptions;
                    let { options,list } = res;

                    let instance = isPage? new PageInstance(options):new ComponentInstance(options)
                    list.add(instance)
                    return ;
            }
        }

        throw new Error(`No Find TemplateId ${templateId} When Create Component${options.name}`)

    }
}