import {
  hasOwn
} from '@po/shared'

import {
  VNode,
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
    
  let oldHas = hasOwn(oldData,name)
  let newHas = hasOwn(newData,name)
  let oldValue = oldData[name];
  let newValue = newData[name];
  const isBoolean = false

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
