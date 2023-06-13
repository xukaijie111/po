


import { VNode, VNodeData } from '../node'
import {
    patchAttr
} from './attrs'


import {
        patchClass
} from './class'


import {
    patchEvent
} from './eventlisteners'

type IMatch = Record<string,(elm:Element,name:string,n1:VNodeData,n2:VNodeData)=>unknown >
const match:IMatch = {
    'class':patchClass,
    "on":patchEvent,
}

// 重算element上的attr
export function pacthElementAttrs(elm:Element,oldNode:VNode,newNode:VNode) {
    let oldData = oldNode?.data??{}
    let newData = newNode.data??{}
   let oldKeys = Object.keys(oldData)
   let newKeys = Object.keys(newData)

   let keys = Array.from(new Set(oldKeys.concat(newKeys)));
   keys.forEach((key) => {
        if (match[key]) match[key](elm,key,oldNode,newNode)
        else patchAttr(elm,key,oldNode,newNode)
   })

}