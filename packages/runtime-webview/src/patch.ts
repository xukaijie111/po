import { isUndef, ShapeFlags } from "@po/shared";
import { htmlDomApi } from "./htmldomapi";
import { VNode , assignNode } from "./Node";

import {
  pacthElementAttrs
} from './modules/mergeData'



type KeyToIndexMap = { [key: string]: number };



export function isSameVNode(n1: VNode, n2: VNode) {

  return n1.tagName === n2.tagName && n1.key === n2.key
}




function removeVnodes(
  parentElm: Node,
  vnodes: VNode[],
  startIdx: number,
  endIdx: number
): void {
  for (; startIdx <= endIdx; ++startIdx) {
    const ch = vnodes[startIdx];
    if (ch.isComponent()) {
        console.log(`####删除组件dom`)
        ch.component.remove();
    }else {
      console.log(`###删除普通dom`)
      htmlDomApi.removeChild(parentElm, ch.elm!)
    }
   
  }
}

export function unmount(node:Node) {
    let parent = htmlDomApi.parentNode(node);
    parent.removeChild(node);
}

function createKeyToOldIdx(
  children: VNode[],
  beginIdx: number,
  endIdx: number
): KeyToIndexMap {
  const map: KeyToIndexMap = {};
  for (let i = beginIdx; i <= endIdx; ++i) {
    const key = children[i]?.key;
    if (key !== undefined) {
      map[key as string] = i;
    }
  }
  return map;
}


async function addVnodes(
  parentElm: Node,
  before: Node | null,
  vnodes: VNode[],
  startIdx: number,
  endIdx: number,
) {
  for (; startIdx <= endIdx; ++startIdx) {
    const ch = vnodes[startIdx];
    if (ch != null) {
      await amountElement(ch,parentElm,before)
    }
  }
}


// 相同的vnode匹配
async function patchVNode(oldNode: VNode, newNode: VNode) {

  let { children: oldChildren } = oldNode;
  let { children: newChildren } = newNode

  assignNode(newNode,oldNode)
  let elm = newNode.elm 

  // 两个都是element元素标签
  if ((oldNode.isElement() && newNode.isElement()) ||
    (oldNode.isFragment() && newNode.isFragment())) {
    pacthElementAttrs(elm as Element, oldNode, newNode)

    if (oldNode.isArrayChildren() && newNode.isArrayChildren()) {
      // 都是数组子项
      console.log(`都是数组chidlren `)
      await updateChildren(elm!, oldChildren as VNode[], newChildren as VNode[])

    } else if (oldNode.isArrayChildren()) {
      // 老节点是数组子项目,新节点是单个子项
      console.log(`老的是数组chidlren `)
      // 不同的子节点，删除了，增加文本
      removeVnodes(elm!, oldChildren as VNode[], 0, oldChildren!.length - 1)
      htmlDomApi.setTextContent(elm!, newChildren as string || "")
    } else if (newNode.isArrayChildren()) {
      console.log(`新的是数组chidlren `)
      // 新节点是数字子项，老节点是文本
      htmlDomApi.setTextContent(elm!, "")
      //@ts-ignore
      await addVnodes(elm!, null, newChildren as VNode[], 0, newChildren.length - 1);
    } else {
      // 两个都是text
      console.log(`都是text文本节点`,elm,newChildren,oldChildren)
      if (oldChildren !== newChildren)
        htmlDomApi.setTextContent(elm!, newChildren as string || "")
    }


  } else if ((oldNode.isComment() && newNode.isComment()) ||
            (oldNode.isText() && newNode.isText())
  ) {
    htmlDomApi.setTextContent(elm!, newChildren as string || "")
  }else if (oldNode.isComponent() && newNode.isComponent()){
      // todo 组件
      console.log(`都是component节点，由组件自己去更新`)
  }
}


async function updateChildren(
  parentElm: Node,
  oldCh: VNode[],
  newCh: VNode[],
) {
  let oldStartIdx = 0;
  let newStartIdx = 0;
  let oldEndIdx = oldCh.length - 1;
  let oldStartVnode = oldCh[0];
  let oldEndVnode = oldCh[oldEndIdx];
  let newEndIdx = newCh.length - 1;
  let newStartVnode = newCh[0];
  let newEndVnode = newCh[newEndIdx];
  let oldKeyToIdx: KeyToIndexMap | undefined;
  let idxInOld: number;
  let elmToMove: VNode;
  let before: any;

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {

    if (oldStartVnode == null) {
      oldStartVnode = oldCh[++oldStartIdx]; // Vnode might have been moved left
    } else if (oldEndVnode == null) {
      oldEndVnode = oldCh[--oldEndIdx];
    } else if (newStartVnode == null) {
      newStartVnode = newCh[++newStartIdx];
    } else if (newEndVnode == null) {
      newEndVnode = newCh[--newEndIdx];
    } else if (isSameVNode(oldStartVnode, newStartVnode)) {
      patchVNode(oldStartVnode, newStartVnode,);
      oldStartVnode = oldCh[++oldStartIdx];
      newStartVnode = newCh[++newStartIdx];
    } else if (isSameVNode(oldEndVnode, newEndVnode)) {
      patchVNode(oldEndVnode, newEndVnode,);
      oldEndVnode = oldCh[--oldEndIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (isSameVNode(oldStartVnode, newEndVnode)) {
      // Vnode moved right
      patchVNode(oldStartVnode, newEndVnode);
      htmlDomApi.insertBefore(
        parentElm,
        oldStartVnode.elm!,
        htmlDomApi.nextSibling(oldEndVnode.elm!)
      );
      oldStartVnode = oldCh[++oldStartIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (isSameVNode(oldEndVnode, newStartVnode)) {
      // Vnode moved left
      patchVNode(oldEndVnode, newStartVnode);
      htmlDomApi.insertBefore(parentElm, oldEndVnode.elm!, oldStartVnode.elm!);
      oldEndVnode = oldCh[--oldEndIdx];
      newStartVnode = newCh[++newStartIdx];
    } else {

      if (oldKeyToIdx === undefined) {
        oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
      }


      idxInOld = oldKeyToIdx[newStartVnode.key as string];

      if (isUndef(idxInOld)) {
        // new Element
        await amountElement(newStartVnode,parentElm,oldStartVnode.elm!)
   
      } else {
        elmToMove = oldCh[idxInOld];
        if (elmToMove.tagName !== newStartVnode.tagName) {
          await amountElement(newStartVnode,parentElm,oldStartVnode.elm!)
        } else {
          patchVNode(elmToMove, newStartVnode,);
          oldCh[idxInOld] = undefined as any;
          htmlDomApi.insertBefore(parentElm, elmToMove.elm!, oldStartVnode.elm!);
        }
      }
      newStartVnode = newCh[++newStartIdx];
    }
  }

  if (newStartIdx <= newEndIdx) {

    before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm;
    await addVnodes(
      parentElm,
      before,
      newCh,
      newStartIdx,
      newEndIdx,
    );
  }
  if (oldStartIdx <= oldEndIdx) {
    removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
  }
}

export async function patch(oldNode: VNode, newNode: VNode) {
  if (oldNode === newNode) return;

  let { elm: oldElm } = oldNode;

  if (isSameVNode(oldNode, newNode)) {
    await patchVNode(oldNode, newNode);
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

}


function insertElm(parent: Node, inserted: Node, referNode: Node) {
  
  htmlDomApi.insertBefore(parent!, inserted, referNode)
}

// 创建真实的DOM
// 1、如果是组件占位符，则会创建新的组件
// 2、如果是DOM元素的话,正常处理

export async function amountElement(vnode: VNode, parentElm: Node, refElm: Node | null = null): Promise<Node> {


  let elm: Node
  let { shapeFlag, data, children, tagName } = vnode;

  if (shapeFlag & ShapeFlags.COMMENT) {
    elm = htmlDomApi.createComment(children as string)
  }
  else if (shapeFlag & ShapeFlags.ELEMENT || shapeFlag & ShapeFlags.FRAGMENT) {
    data ??= {}

    let isElement = shapeFlag & ShapeFlags.ELEMENT
    //@ts-ignore
    elm = isElement ? htmlDomApi.createElement(tagName) : htmlDomApi.createDocumentFragment()
    pacthElementAttrs(elm as Element, null, vnode);

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      let child = htmlDomApi.createTextNode(children as string);

      elm.appendChild(child)
    } else {
      children ??= [];

      for (let child of children) {

        await amountElement(child as VNode, elm)

      }

    }
  }
  else if (vnode.isComponent()) {
    let { data, options,component } = vnode


    console.log(`组件是`, vnode,vnode.tagName)

    //@ts-ignore
    let Ctor = component.__proto__.constructor;

    let comp = new Ctor(options, data , component.container)

    

    component.addChildren(comp)
    comp.parent = component;

    vnode.inlineComponent = comp;

    await comp.init();

    await comp.amount(parentElm, refElm)

  } else if (shapeFlag === ShapeFlags.TEXT) {
    elm = htmlDomApi.createTextNode(children as string)
  } else {
    throw Error(`what shapeflag?${shapeFlag}`)
  }

  if (elm) {
    insertElm(parentElm, elm, refElm)
    vnode.elm = elm
  } 
  //@ts-ignore
  return elm;

}


