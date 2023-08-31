import { ComponentOptions } from "./expose";


import {
    LifeTimes,
    diffAndClone,
    getDataByPath,
    hasOwn
} from '@po/shared'
import { Application } from "./Application";
import { 

    INIT_COMPONENT_DATA,
    isSpecialKey
 } from "@po/shared";

 export type CreateComponentData = Omit<INIT_COMPONENT_DATA,"propKeys"> & { props : Record<string,any>}

export class BaseInstance {

    data:Record<string,any>
    methods:Map<string,Function>
    observers:Map<string,Function>
    lifetimes:Map<LifeTimes,Function>
    isPage:boolean
    options:BaseInstance.options
    id:string
    webview:any
    onCreated:Function
    onShow:Function
    onReady:Function
    onDestroyed:Function
    children:Set<BaseInstance>
    constructor(options:BaseInstance.options) {
        this.options = options
        this.data = {}
        this.methods = new Map();
        this.observers = new Map();
        this.lifetimes = new Map();
        this.children = new Set();
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

    getUserData(){
        return this.data;
    }


    initRender() {


    }

    getData() {
        return this.data
    }


    getDataByKeys(keys:string[]) {
        let data = {}
        keys.forEach((key) => {
            if (isSpecialKey(key)) return ;
            if (hasOwn(this.data,key)) {
                data[key] = this.data[key]
            }
        })

        return data;
    }


    callHookCreate() {
        try{
            this.onCreated();
        }catch(err) {
            console.error(err)
        }
    }


    callHookReady() {
        try{
            this.onReady();
        }catch(err) {
            console.error(err)
        }
    }


    addChild(child) {
        this.children.add(child)
    }


}


export namespace BaseInstance {

    export type options = {
        initData:CreateComponentData,
        runOptions:ComponentOptions,
        application:Application

    }
}