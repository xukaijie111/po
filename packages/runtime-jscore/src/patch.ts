import type { IVNODE } from "./Instance";


function  isSameVNode(newVnode:IVNODE,oldVnode:IVNODE) {

    return newVnode.tag === oldVnode.tag &&
            newVnode.key === oldVnode.key &&
            newVnode.shapeFlage === oldVnode.shapeFlage

}

export function patch(newVnode:IVNODE,oldVnode:IVNODE) {


    if (!oldVnode) return newVnode;
    if (oldVnode === newVnode) return;


  if (isSameVNode(oldNode, newNode)) {
         patchVNode(oldNode, newNode);
  } else {

    let parent = htmlDomApi.parentNode(oldElm!);
    if (!parent) {
      console.error(`why old node has no parent?`)
      return;
    }

    await amountElement(newNode, parent, oldElm)

    // todo 组件写在要执行的
    //@ts-ignore
    removeVnodes(parent, [oldNode], 0, 0);
  }

    return newVnode

}