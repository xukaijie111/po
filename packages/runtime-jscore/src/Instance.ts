import { ComponentOptions } from "./expose";
import { observable, observe , unobserve } from '@nx-js/observer-util';


import {
    LifeTimes,
    diffAndClone,
    getDataByPath,
    hasOwn,
    PROTOCOL_CMD,
    MESSAGE_COMPONENT_SET_DATA_DATA,
    isDynamaticExpression
} from '@po/shared'
import { Application } from "./Application";
import { 

    INIT_COMPONENT_DATA,
    isSpecialKey
 } from "@po/shared";


 import {
    queuePostFlushCb
 } from "./scheduler"


 type IMessageFromChild = {
    type:"destroyed",
    data:{
        id:string,
    } & Record<string,string>
 }



 export type CreateComponentData = Omit<INIT_COMPONENT_DATA,"propKeys"> & { props : Record<string,any>}

 export type IChidlren = {

    componentId: {

        component:BaseInstance,
        propKeys:Array<string>  // children de

    }

 }

export class BaseInstance {

    data:Record<string,any>
    methods:Map<string,Function>
    observers:Map<string,Function>
    lifetimes:Map<LifeTimes,Function>
    isPage:boolean
    options:BaseInstance.options
    id:string
    container:any
    onCreated:Function
    onShow:Function
    onReady:Function
    onDestroyed:Function
    children:Array< { id:string,component:BaseInstance, childDynamticPropExpression:Array<any> }> = [] 
    propKeys = []
    childDynamticPropExpression = {} //子组件属性的动态表达式
    listenPropSet = {}
    listenDataKeys = new Set<string>
    parent:BaseInstance
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

    setParent(pa:BaseInstance){
        this.parent = pa;
    }

    initLifeTimes() {

        let { runOptions ,initData} = this.options

        let { query } = initData

        let { onCreated,onReady,onShow , onDestroyed } = runOptions
        
        this['onCreated'] = () => {
            if (onCreated) {
                onCreated.call(this,query)
            }

        }

        this['onShow'] = () => {
            if (onShow) {
                onShow.call(this)
            }
        }

        this['onReady'] = () => {
            if (onReady) {
                onReady.call(this)
            }
        }

        this["onDestroyed"] = () => {
            if (onDestroyed) {
                this.doDestroyed();
                onDestroyed.call(this)
            }

        }

    }


    doDestroyed() {
        //container注销
        // 父组件的属性监听取消
        // 自身的响应式取消

        this.container.removeComponent(this.id);
        this.parent?.receiveMessageFromChild({
            type:"destroyed",
            data:{
                id:this.id
            }
        })

    }


    receiveMessageFromChild(params:IMessageFromChild) {
        let { type,data } = params;
        let { id } = data

        switch(type) {

            case "destroyed" : 
                this.unObserveChildProps(id);
                break
        }

    }


    unObserveChildProps(id:string) {

        let { children } = this;

        let ids = children.map((child) => child.id);

        let index = ids.indexOf(id);

        if (index === -1) return ;

        let child = children[index];

        let { childDynamticPropExpression } = child

        childDynamticPropExpression.forEach((item) => {


            let { getter } = item;

            if (getter) {
                unobserve(getter);
            }
        })



    }


    initData() {
        let { runOptions} = this.options
        let { data = { }} = runOptions
        Object.assign(this.data,data);
        this.data = observable(diffAndClone(this.data,{}).clone);
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


    initChildPropListen(value) {

        let { component, childDynamticPropExpression  = [] } = value

        childDynamticPropExpression.forEach((item) => {

            if (item.getter) return ;
            let { key , expression   } = item;

            let func = new Function(`_ctx`, `return ${expression}`)
            let getter =  () => {
                    let res =  func(this.data);
                    console.log(`######子组件需要的属性变了,`,key,res);
                    // 初始化的时候，不需要更新，
                    if (item.inited) {
                        component.notifyPropChange(key,res);
                    }

                    item.inited = true
                  
                    return res;
            }   
    
            item.getter = getter;
            observe(getter);
        })
    }


   

    getData() {
        return this.data
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



    addChild(child:BaseInstance , {
        props
    }) {
        let childDynamticPropExpression = [];
        for (let key in props) {
            let expression = props[key];
            if (!isSpecialKey(key) && expression.indexOf("_ctx") !== -1) {
                childDynamticPropExpression.push({
                    key,
                    expression
                })
            }
        }
        
        let value = {
            id:child.id,
            component:child,
            childDynamticPropExpression
        }


        this.initChildPropListen(value);
    
        this.children.push(value)
    }


    setData(value:Record<string,string>,callback?:Function) {

        if (!value) return ;
        let reg = /^((?:(?![\[\.])\w)+)(.*)/;
        let keys  = Object.keys(value);
        if (!keys.length) return ;
        let realValue = { ...value };
        keys.forEach((key) => {
            let match = key.match(reg);
            if (!match) {
                console.error(`setdata no match ? ${value}`)
            }
            let realKey = match[1];
            if (this.propKeys.includes(realKey)) {
                console.warn(` key ${realKey} is props Key , can not be set`)
                delete realValue[key]
            }
        })

        let realKeys = Object.keys(realValue)
        if (!realKeys.length) return ;

        
        realKeys.forEach((key) => {
            this.data[key] = realValue[key]
            this.listenDataKeys.add(key);
        })


        queuePostFlushCb(this.doRender);

    }


    doRender = () => {


        let { listenDataKeys ,listenPropSet} = this;

        let keys = Object.keys(listenPropSet).concat(Array.from(listenDataKeys))

        let value = {}

        keys.forEach((key) => {
            value[key] = this.data[key]
        })

        let data : MESSAGE_COMPONENT_SET_DATA_DATA = {
            type:PROTOCOL_CMD.S2C_SET_DATA,
            data:{
                componentId:this.id,
                data:{
                    ...value
                }
                
            }
        }

        console.log(`###send data is`,data)
        this.container.send(data);

        // 渲染完成后，清空
        this.listenDataKeys.clear();
        this.listenPropSet = {};
    }

    getPropsDataByExpression(expression : string) {
        let func = new Function(`_ctx`, `return ${expression}`)
        let res = func(this.data);

        console.log(`#####express value is `,res,expression)
        
        return res
    }


    callMethod(funcExpOrName,params) {
        let methodName = funcExpOrName
        if (isDynamaticExpression(null,funcExpOrName)) {
            let func = new Function(`_ctx`, `return ${funcExpOrName}`);
            methodName = func(this.data)
        }
       
        if (this[methodName]) {
            this[methodName](params);
        }else {
            console.warn(`未找到点击事件 ${methodName}`)
        }
       
    }




}


export namespace BaseInstance {
    export type options = {
        initData:CreateComponentData,
        runOptions:ComponentOptions,
        application:Application

    }
}