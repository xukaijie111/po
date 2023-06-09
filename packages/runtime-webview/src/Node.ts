
import { ShapeFlags,isString } from '@po/shared'
import { Component } from './component';

export type ExposeComponentOptions = {
    render: Function,
    name: string,
    id:string
}


let currentComponent:Component

export function pushCurrentComponent(instance) {
    currentComponent = instance
}

export function popCurrentComponent() {
    currentComponent = null
}


export type VNodeData = {
    [key: string]: any; // 自定义属性
}
export type VNodeChildren = Array<VNode> | string

export type VNodeTagName = string

export class VNode {

    tagName:VNodeTagName
    namespace:string | undefined
    data:VNodeData | undefined
    children?:VNodeChildren
    key?:string | null
    elm?:Node
    shapeFlag:ShapeFlags

    component:Component // 占位符所在的组件

    inlineComponent:Component // 真正的组件

    options:ExposeComponentOptions
    constructor(params:VNode.params) {
        let { tagName ,namespace ,data, children,shapeFlage  } = params

        this.tagName = tagName;
        this.namespace = namespace;
        this.data = data;
        this.children = children
        this.key = data?.key
        this.shapeFlag = shapeFlage!;
        this.options = params?.options
        this.component = currentComponent

        if (tagName)
            this.shapeFlag |= isString(children)? ShapeFlags.TEXT_CHILDREN:ShapeFlags.ARRAY_CHILDREN
        
    }

    // 标签元素
    isElement(){
        return this.shapeFlag & ShapeFlags.ELEMENT
    }

    // 文本
    isText() {
        return this.shapeFlag & ShapeFlags.TEXT
    }

    // 注释文本

    isComment() {
        return this.shapeFlag & ShapeFlags.COMMENT
    }

    isFragment() {
        return this.shapeFlag & ShapeFlags.FRAGMENT
    }


    isTextChildren() {
        return this.shapeFlag & ShapeFlags.TEXT_CHILDREN
    }

    isArrayChildren() {
        return this.shapeFlag & ShapeFlags.ARRAY_CHILDREN
    }


    isComponent(){
        return this.shapeFlag & ShapeFlags.COMPONENT
    }

}

export namespace VNode {
    export type params = {
        tagName:VNodeTagName
        namespace?:string,
        data?:VNodeData | undefined
        children?:VNodeChildren
        shapeFlage?:ShapeFlags
        options?:ExposeComponentOptions
    }
}


export function createElementVNode(tagName:string,data:VNodeData,children:VNodeChildren,namespace:string) {
    return new VNode({
        tagName,
        data,
        children,
        namespace,
        shapeFlage:ShapeFlags.ELEMENT
    })
}


export function createTextVNode(tagName:string | undefined,data:VNodeData | undefined ,children:VNodeChildren,namespace:string,) {
    return new VNode({
        tagName,
        data,
        children,
        namespace,
        shapeFlage:ShapeFlags.TEXT
    })
}


export function createCommentVNode(tagName:string | undefined,data:VNodeData | undefined ,children:VNodeChildren,namespace:string,) {
    return new VNode({
        tagName,
        data,
        children,
        namespace,
        shapeFlage:ShapeFlags.COMMENT
    })
}


export function createFragmentVNode(tagName:string | undefined,data:VNodeData | undefined ,children:VNodeChildren,namespace:string) {

    return new VNode({
        tagName,
        data,
        children,
        namespace,
        shapeFlage:ShapeFlags.FRAGMENT
    })
}



export function createComponentVNode(tagName:string,options:ExposeComponentOptions,props:Record<string,any>) {
    return new VNode({
        tagName:tagName,
        data:props,
        options,
        shapeFlage:ShapeFlags.COMPONENT,
    })
}


export function renderList(list:any,fn:Function) {
    return list.map((item,index) => {
        return fn(item,index)
    })

}


export function assignNode(n1:VNode,n2:VNode) {


    n1.inlineComponent = n2.inlineComponent;

    n1.component = n2.component;

    n1.elm = n2.elm
}