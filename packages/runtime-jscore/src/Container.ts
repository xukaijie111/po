


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
import { BaseInstance } from './Instance';

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
            throw new Error(`Path ${this.currentComponentOptions.path} Has No Component/Page Register`)
        }
        this.currentComponentOptions = options
    }

    addComponent(options: ComponentOptions) {
        let { currentComponentOptions } = this;

        if (!currentComponentOptions) {
            throw new Error(`Has No Component/Page Register`)
        }

        this.componentsMap.set(currentComponentOptions, {
            options,
            list: new Set()
        })


    }



    createComponent(initData: INIT_COMPONENT_DATA) {

        let { templateId } = initData

        let { componentsMap } = this;

        let keys = Array.from(componentsMap.keys());

        for (let i = 0; i < keys.length;i++) {
            let compilerOptions = keys[i];
            if (compilerOptions.templateId === templateId) {
                    let res = componentsMap.get(compilerOptions)
                    let { isPage } = compilerOptions;
                    let { options,list } = res;

                    let instanceOptions:BaseInstance.options = {
                        initData,
                        runOptions:options,
                        container:this

                    }
                    let instance = isPage? new PageInstance(instanceOptions):new ComponentInstance(instanceOptions)
                    list.add(instance)
                    this.currentComponentOptions = null;
                    return ;
            }
        }

        throw new Error(`No Find TemplateId ${templateId} When Create Component${initData.name}`)

    }
}