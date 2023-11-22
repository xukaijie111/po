import { ComponentOptions } from "./expose";
import { observable, observe , unobserve } from '@nx-js/observer-util';


import {
    LifeTimes,
    diffAndClone,
    getDataByPath,
    generateMixed,
    CREATE_COMPONENT_DATA,
    PROTOCOL_CMD,
    CompilerComponentOptions,
    ShapeFlags
} from '@po/shared'
import { Application } from "./Application";


 import _ from "@po/shared"

 import {
    queuePostFlushCb
 } from "./scheduler"


 export type INSTANCEHOOKNAME = "onDestroyed"

export type IVNODE = {
    tag: string,
    id:string,
    key:string,
    props?: Record<any, any>,
    children ? : Array<IVNODE>,
    vnode?:IVNODE // 组件内部真正的虚拟节点
    shapeFlage: ShapeFlags,
    compilerOptions ? :CompilerComponentOptions // 创建组件需要的
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
    children:Array<BaseInstance> = [] 
    propKeys = []
    listenPropSet = {}
    listenDataKeys = new Set<string>
    parent:BaseInstance
    hooks:Record<INSTANCEHOOKNAME,Array<Function>>
    vnode:IVNODE
    prevVnode:IVNODE
    application:Application
    constructor(options:BaseInstance.options) {
        this.options = options
        this.application = options.application
        this.id = generateMixed();
        this.data = {}
        this.methods = new Map();
        this.observers = new Map();
        this.lifetimes = new Map();
        this.hooks = {
            "onDestroyed":[]
        }
    }



    init() {
        this.initLifeTimes();
        this.initMethods();
        this.initLifeTimes();
        this.callHookCreate();
        this.callHookShow();
        this.callHookReady();

        this.observeData();

        // 初始化数据监听
        this.initObservers();


        this.render();
    }


    render() {
        let { options } = this;
        let { compilerOptions } = options;

        let { render } = compilerOptions;

        this.vnode = render.call(this,this.data);

    }

    getVnode() {
        return this.vnode
    }

    getMetaVnode(vnode:IVNODE) {

        
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

        let { runOptions ,createOptions} = this.options

        let { query = {} } = createOptions

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


   


    findChildById(id:string) : BaseInstance {

        let { children } = this;;

        let child = _.find(children, { id })
        return child
    }


    observeData() {
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

    callHookShow() {
        try{
            this.onShow();
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
        })

        queuePostFlushCb(this.doRender);

    }


    doRender = () => {


        this.prevVnode = this.vnode;

        this.render()

        let diff = this.patch(this.vnode,this.prevVnode);

        this.application.send({
            type: PROTOCOL_CMD.S2C_SET_DATA,
            data: {
                componentId:this.id,
                data:this.getMetaVnode(diff)
            }
        })
    }


    patch(newVnode:IVNODE,oldVnode:IVNODE) {


        if (!oldVnode) return newVnode

        


        return newVnode

    }





    callMethod(funcExpOrName,params) {
        let methodName = funcExpOrName
        if (this[methodName]) {
            this[methodName](params);
        }else {
            console.warn(`未找到点击事件 ${methodName}`)
        }
       
    }


    createElementVNode(tag: string, props: Record<any, any>, children: IVNODE[]): IVNODE {
        return {
            tag,
            props,
            key:props.key,
            id:generateMixed(),
            children,
            shapeFlage: ShapeFlags.ELEMENT
        }
    }



    createComponentVNode(tag:string,options:CompilerComponentOptions,props:Record<string,any>) :IVNODE {

        return {
            tag,
            id:generateMixed(),
            key:props.key,
            compilerOptions:options,
            props:props,
            shapeFlage:ShapeFlags.COMPONENT
        }
    }



   renderList(list:any,fn:Function) {
        return list.map((item:any,index:number) => {
            return fn(item,index)
        })
    
    }


}


export namespace BaseInstance {
    export type options = {
        createOptions:CREATE_COMPONENT_DATA
        compilerOptions:CompilerComponentOptions
        runOptions:ComponentOptions,
        application:Application
    }
}