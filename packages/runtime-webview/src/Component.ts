




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
    amountElement, patch
} from './patch'

import { VNode  , pushCurrentComponent,popCurrentComponent} from "./Node";
import { getCustomPropKeys } from './helper';
import { Container } from './container';


export class Component {

    parent: Component 
    children: Array<Component>
    container:Container
    cache: Record<string, any>
    vnode:VNode
    prevVnode:VNode
    id:string
    props:Record<string,any>
    data:Record<string,any>
    constructor(private options: CompilerComponentOptions, props: Record<string, any>) {
        this.props = props || {}
        this.id = generateMixed()
        this.children = [];
        //@ts-ignore
        this.cache = {};// 缓存DOM事件

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
                propKeys:getCustomPropKeys(props)
            }
        })

        console.log(`####this.data is `,JSON.stringify(this.data));

        return ;
    }

    callMethod(name: string): void {

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
    getOn(name: string) {
        let { cache, id } = this;
        if (cache[name]) return cache[name]

        cache[name] = function (event: Event) {
            let data: MESSAGE_DOM_ON_CLICK_DATA = {
                type: PROTOCOL_CMD.C2S_DOM_ON_CLICK,
                data: {
                    componentId: id,
                    name,
                    params: "will to do"
                }
            }
            this.send(data)

            event.stopPropagation();
        }

        return cache[name]
    }


    async update(data) {
        this.data = data;
        this.render();
        patch(this.prevVnode,this.vnode)
    }


    addChildren(child: Component) {
        this.children.push(child)
    }
}