import { ComponentOptions } from "./expose";
import { observable, observe , unobserve } from '@nx-js/observer-util';


import {
    LifeTimes,
    diffAndClone,
    getDataByPath,
    PROTOCOL_CMD,
    MESSAGE_COMPONENT_SET_DATA_DATA,
    isDynamaticExpression
} from '@po/shared'
import { Application } from "./Application";
import { 

    INIT_COMPONENT_DATA,
    isComponentCustomPropKey,
    isComponentCustomEventKey
 } from "@po/shared";

 import _ from "@po/shared"

 import {
    queuePostFlushCb
 } from "./scheduler"


 export type CreateComponentData = Omit<INIT_COMPONENT_DATA,"propKeys"> & { props : Record<string,any>}



 export type INSTANCEHOOKNAME = "onDestroyed"


 type IChildDynamticPropExpression = {
    key:string,
    expression:string,
    getter?:Function
 }

 export type IChildren = {
    id:string,
    component:BaseInstance, 
    childDynamticPropExpression?:Array<IChildDynamticPropExpression>,
    childEventExpressionLists?:Array<{
        key:string,
        expression:string
    }>

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
    children:Array<IChildren> = [] 
    propKeys = []
    listenPropSet = {}
    listenDataKeys = new Set<string>
    parent:BaseInstance
    hooks:Record<INSTANCEHOOKNAME,Array<Function>>
    constructor(options:BaseInstance.options) {
        this.options = options
        this.data = {}
        this.methods = new Map();
        this.observers = new Map();
        this.lifetimes = new Map();
        this.hooks = {
            "onDestroyed":[]
        }
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
                onDestroyed.call(this)
            }

        }


        this.addHook("onDestroyed", () => {
            this.unObserveChildrenProps();
            this.parent?.unObserveChildProps(this.id);
        })


    }

    addHook(name:INSTANCEHOOKNAME,func:Function) {
        this.hooks[name].push(func)
    }


    doDestroyed() {
        //container注销
        // 父组件的属性监听取消
        // 自身的响应式取消

        let { onDestroyed = []  } = this.hooks

        onDestroyed.forEach((hook) => {
            hook();
        })
       

    }


    unObserveChildrenProps() {

        this.children.forEach((child) => {
            this.unObserveChildProps(child.id)
        })
    }

    unObserveChildProps(id:string) {


        let child = this.findChildById(id)
        if (!child) return;

        let { childDynamticPropExpression } = child

        childDynamticPropExpression.forEach((item) => {
            let { getter } = item;
            if (getter) {
                unobserve(getter);
            }
        })



    }


    findChildById(id) : IChildren {

        let { children } = this;;

        let child = _.find(children, { id })
        return child
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
        let childEventExpressionLists = [];
        for (let key in props) {
            let expression = props[key];
            if (isComponentCustomPropKey(key) && expression.indexOf("_ctx") !== -1) {
                childDynamticPropExpression.push({
                    key,
                    expression
                })
            }

            if (isComponentCustomEventKey(key)) {
                childEventExpressionLists.push({
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
     
        return res
    }


    getReallyName(expOrStr:string) {
        let res = expOrStr;
        if (isDynamaticExpression(expOrStr)) {
            let func = new Function(`_ctx`, `return ${expOrStr}`);
            res = func(this.data);
        }

        return res;
    }


    callMethod(funcExpOrName,params) {
        let methodName = this.getReallyName(funcExpOrName);
        if (this[methodName]) {
            this[methodName](params);
        }else {
            console.warn(`未找到点击事件 ${methodName}`)
        }
       
    }

    $emit(name:string,args:any) {

        if (this.parent) {
            this.parent.emitEventByChild({
                id:this.id,
                name,
                args
            })
        }

    }


    emitEventByChild({
        id,
        name,
        args
    }) {

        let child = this.findChildById(id)
        if (!child) return;

        let { childEventExpressionLists = [] } = child

        let item = _.find(childEventExpressionLists , { key:name })

        if(!item) {
            console.warn(`Can not find event name ${name}`)
            return 
        }

        let { expression } = item;
        let exp = this.getReallyName(expression);
        if (this[exp]) {
            this[exp](args)
        }
        else {
            console.warn(`未找到点击事件 ${exp}`)
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