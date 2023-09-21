

import {
  VNode
} from '../Node'

let map = {
  'on':"click"
}

export function patchEvent(
  elm: Element,
  name:string,
  oldNode: VNode,
  newNode: VNode
): void {

  let oldData = oldNode?.data??{}
  let newData = newNode.data??{}

  let oldValue = oldData[name];
  let newValue = newData[name];

  if (oldValue === newValue) {
    return;
  }
  if (oldValue && newValue &&(oldValue.value === newValue.value)) {
    return ;
  }

  if (oldValue) {
    let instance = oldNode.component;
    let func = instance.getOn(oldValue)
    elm.removeEventListener(map[name], func, false);
  }

  if (newValue) {
    let instance = newNode.component;
    let func = instance.getOn(newValue)
    elm.addEventListener(map[name], func, false);
  }
}

