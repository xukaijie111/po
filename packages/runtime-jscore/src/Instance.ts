import { ComponentOptions } from "./expose";


import {
    LifeTimes,
    diffAndClone,
    getDataByPath
} from '@po/shared'
import { Container } from "./container";
import { INIT_COMPONENT_DATA } from "@po/shared";

export class BaseInstance {

    data:Record<string,any>
    methods:Map<string,Function>
    observers:Map<string,Function>
    lifetimes:Map<LifeTimes,Function>
    isPage:boolean
    options:BaseInstance.options
    id:string
    constructor(options:BaseInstance.options) {
        this.options = options
        this.data = {}
        this.methods = new Map();
        this.observers = new Map();
        this.lifetimes = new Map();
        this.init();
    }


    init() {
        this.initId();
        this.initData();
        this.initLifeTimes();
        this.initMethods();

    }


    initId() {

        let { initData } = this.options
        this.id = initData.componentId
    }


    initObservers() {
        let { runOptions } = this.options

        let { observers = { }} = runOptions

        for (let name in observers) {
            let lists = name.split(',').map((item) => item.trim())

            let origin = observers[name];

            let proxyed = () => {
                let params = lists.map((item) => {
                        let res = [];
                        try{
                            res.push(getDataByPath(this,item))
                        }catch(error) {
                            res.push(undefined)
                        }
                        return res;

                })
                origin.call(this,...params)
            }

            this.observers.set(name,proxyed)


        }

    }

    initLifeTimes() {

        let { runOptions ,initData} = this.options

        let { query } = initData

        let { onCreated,onReady,onShow } = runOptions
        

        this['onCreated'] = () => {
            if (onCreated) {
                onCreated.call(this,query)
            }

        }

        this['onShow'] = () => {
            if (onShow) {
                onShow.call(this,query)
            }
        }

        this['onReady'] = () => {
            if (onReady) {
                onReady.call(this,query)
            }
        }


    }


    initData() {
        let { runOptions} = this.options
        let { data = { }} = runOptions
        this.data = diffAndClone(data, { }).clone


    }


    initMethods() {
        let { runOptions } = this.options;
        let { methods = {} } = runOptions
        for (let name in methods) {
            let func = methods[name].bind(this)
            this.methods.set(name,func)
            this[name] = func
        }


    }


    initRender() {


    }

    getData() {
        return this.data
    }


}


export namespace BaseInstance {

    export type options = {
        initData:INIT_COMPONENT_DATA,
        runOptions:ComponentOptions,
        container:Container

    }
}