

import {
  VNode
} from '../node'

export function patchClass(el: Element,   
  name:string,
  oldNode: VNode,
  newNode: VNode
  ) {

    let oldData = oldNode?.data??{}
    let newData = newNode.data??{}
    
    let oldValue = oldData[name];
    let newValue = newData[name];

  if (oldValue === newValue) return;

  if (newValue) return el.className = newValue;

  if (oldValue) return  el.removeAttribute('class')

}
