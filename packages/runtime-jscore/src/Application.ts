


import {
    CompilerComponentOptions,
    CREATE_COMPONENT_DATA,
    serialPageName
} from '@po/shared'
import { ComponentInstance } from './Component';

import { PageInstance } from './Page'

import _ from "lodash"


import {
    ComponentOptions
} from './expose'
import { BaseInstance } from './Instance';
import { Command } from './command';



export type CompotionsMap = Map<
    CompilerComponentOptions,
    {
        options: ComponentOptions,
    }
>

export class Application {

    components:Array<ComponentInstance | PageInstance>
    componentsMap: CompotionsMap
    currentCompilerComponentOptions: CompilerComponentOptions | null
    cmd:Command

    constructor(cmd:Command) {
        this.components = [];
        this.currentCompilerComponentOptions = null;
        this.componentsMap = new Map();
        this.cmd = cmd
    }

    send(params) {
        this.cmd.send(params);
    }

    register = (options: CompilerComponentOptions) => {

        if (this.currentCompilerComponentOptions) {
            throw new Error(`Path ${this.currentCompilerComponentOptions.path} Has No Component/Page Register`)
        }
        this.currentCompilerComponentOptions = options
    }

    addComponent(options: ComponentOptions) {
        let { currentCompilerComponentOptions } = this;

        if (!currentCompilerComponentOptions) {
            throw new Error(`Has No Component/Page Register`)
        }

        this.componentsMap.set(currentCompilerComponentOptions, {
            options,
        })


        this.currentCompilerComponentOptions = null;

    }



    createComponent(initData: CREATE_COMPONENT_DATA) {

        let { componentsMap, } = this;


        initData.templateId = serialPageName(initData.templateId)
        initData.name = serialPageName(initData.name)
        let { templateId } = initData

        let keys = Array.from(componentsMap.keys());

        for (let i = 0; i < keys.length;i++) {
            let compilerOptions = keys[i];
            if (compilerOptions.templateId === templateId) {
                    let res = componentsMap.get(compilerOptions)
                    let { isPage } = compilerOptions;
                    let { options } = res;

                    let instanceOptions:BaseInstance.options = {
                        createOptions:initData,
                        compilerOptions:compilerOptions,
                        runOptions:options,
                        application:this

                    }
                    let instance = isPage? new PageInstance(instanceOptions):new ComponentInstance(instanceOptions)
                    this.components.push(instance)

                    instance.addHook("onDestroyed",() => {
                        this.removeComponent(instance.id)
                    })

                    instance.init();
                    return instance ;
            }
        }

        throw new Error(`No Find TemplateId ${templateId} When Create Component${initData.name}`)

    }


    resolveComponent(id:string) {
        let { components } = this
        for (let i = 0 ;i < components.length;i++) {
            if (components[i].id === id) {
                return components[i]
            }
        }

        throw new Error(`Can Not Resolve Component Id : ${id}`)

    }


    removeComponent(id:string) {
        let index = _.findIndex(this.components, { id })
        this.components.splice(index,1)
    }
}