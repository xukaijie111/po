




import {
    generateMixed,
    CompilerComponentOptions,
    MessageDataBase
} from '@po/shared'

import {
    MESSAGE_DOM_ON_CLICK_DATA,
    PROTOCOL_CMD
} from '@po/shared'

import {
    amountElement, patch,
    unmount
} from './patch'

import { VNode  , pushCurrentComponent,popCurrentComponent} from "./Node";
import { Container } from './container';



// 子组件接收父组件的属性相关的定义，
// 在jscore创建组件的时候，告诉父组件，属性是如何计算出来的
// webview的props字段不做任何数据展示，只是告诉jscore的父组件相关的信息

export class Component {

    parent: Component 
    children: Array<Component>
    container:Container
    cache: Record<string, any>
    vnode:VNode
    prevVnode:VNode
    id:string
    props: Record<string,any>
    data:Record<string,any>
    constructor(private options: CompilerComponentOptions, props : Record<string,any> , container:Container) {
        this.props = props  || {}
        this.id = generateMixed()
        this.children = [];
        //@ts-ignore
        this.cache = {};// 缓存DOM事件
        this.container = container
        this.container.addComponent(this)

    }

    setContainer(container:Container) {
        this.container = container;
        return this;
    }


    send(data:MessageDataBase) {
        if (this.container) return this.container.send(data)
        return this.parent.send(data)
    }


    // 执行组件生命周期，创建vnode ,这里还没开始挂载
    async init() {
        await this.callHookCreate();
        this.render();
     }

    callLifeTimes(name: string): void {

    }


    // 执行组件生命周期created/show
    async callHookCreate() {
        let { options,id,props } = this;
        this.data = await this.send({
            type: PROTOCOL_CMD.C2S_INIT_COMPONENT,
            data: {
                name: options.name,
                templateId:options.templateId,
                componentId:id,
                parentId:this.parent?.id,
                props
            }
        })

        console.log(`####this.data is `,this.data,typeof this.data);
        console.log(`####this.data is2 `,this.data.goods,typeof this.data.goods);

        return ;
    }

    sendUnmount() {
        this.children.forEach((child) => {
            child.sendUnmount()
        })

        this.send({
            type:PROTOCOL_CMD.C2S_UNMOUNT_COMPONENT,
            data:{
                componentId:this.id
            }
        })

        this.container.removeComponent(this.id)
    }

   remove() {
        this.sendUnmount();
        unmount(this.vnode.elm);
        
   }


   async amount(elm: Node, refElm: Node = null) {
        return  amountElement(this.vnode,elm,refElm)
    }

    render() {
        let { options,data } = this;
        let { render } = options;

        pushCurrentComponent(this)
        let vnode = render(data)
        popCurrentComponent()
        this.prevVnode = this.vnode;
        this.vnode = vnode
    }


    // 给render 函数调用
    getOn(funExpOrName: string) {
        let { cache, id } = this;
        if (cache[funExpOrName]) return cache[funExpOrName]

        cache[funExpOrName] =  (event: Event) =>{
            let data: MESSAGE_DOM_ON_CLICK_DATA = {
                type: PROTOCOL_CMD.C2S_DOM_ON_CLICK,
                data: {
                    componentId: id,
                    name:funExpOrName,
                    params: event
                }
            }
            console.log(`event is`,event);
            this.send(data)

            event.stopPropagation();
        }

        return cache[funExpOrName]
    }


    async update(data:Record<string,any>) {

        try{
            let keys = Object.keys(data)
            keys.forEach((key) => {
                this.data[key] = data[key]
            })
        }catch(err) {
            console.error(err)
        }
        this.render();
        patch(this.prevVnode,this.vnode)
    }


    addChildren(child: Component) {
        this.children.push(child)
    }
}