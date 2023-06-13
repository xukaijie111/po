import {
  isSpecialBooleanAttr,
  objectHasKey
} from '@wosai/shared'

import {
  VNode,
  VNodeData
} from '../node'

export const xlinkNS = 'http://www.w3.org/1999/xlink'

export function patchAttr(
  el: Element,
  name:string,
  oldNode: VNode,
  newNode: VNode
) {

  let oldData = oldNode?.data??{}
  let newData = newNode.data??{}
    
  let oldHas = objectHasKey(oldData,name)
  let newHas = objectHasKey(newData,name)
  let oldValue = oldData[name];
  let newValue = newData[name];
  const isBoolean = isSpecialBooleanAttr(name)

  // 老节点有属性名，新节点没有，则直接删除
    if (oldHas && !newHas) {
      return  el.removeAttribute(name)
    }
    else if (newHas && !oldHas) {
     return el.setAttribute(name, isBoolean ? '' : newValue)
    }else if (newHas && oldHas) {
      if (oldValue === newValue) return;
      return el.setAttribute(name, isBoolean ? '' : newValue)
    }else {
      console.error(`都没有怎么进来了????`)
    }
  
}
