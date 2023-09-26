
import {
    RootNode,
    ElementNode,
    TemplateNode,
    NodeTypes,
    TextNode,
    ElementCodegenNode,
    InterpolationNode
} from './ast'

import _ from 'lodash'

import {
    isNil,
} from '@po/shared'


import {
    getAst,
    walkNode
} from '@po/cjs-utils'


export function isPxsModule(name:string,node:RootNode) {
    let { imports } = node;
  
    return !!_.find(imports,{ value:name })
}


export function isMethods(name:string,node:RootNode) {
    let { methods } = node;
  
    return !!methods.includes(name)
}




export function checkNodeHasForSameName(node:TemplateNode,name:string):boolean {

  
    if (!node) return false
    //@ts-ignore
    let { parent , forInfo } = node;

    if (forInfo) {
      let { itemName ,indexName } = forInfo
      if (itemName === name || indexName === name) {
        return true
      } 
    }

    if (!parent) return false;

    return checkNodeHasForSameName(parent as ElementNode ,name)

}


// 去掉头尾双括号
export function deleteBrackets(value:any) {
    if (isNil(value)) return null;
    //@ts-ignore
    return value.replace(/^\s*{{\s*(((?!}}).)+)\s*}}\s*$/, ($0, $1) => $1); //去除开头结尾首位的空格
}



/**
 * 记录data
 * @param exp 
 * 
 */
export function parseData(exp:string,node:TemplateNode ,handler:any = {}) {


    let matches = getExpMatches(exp);

    let rootNode = getRootNode(node);
    let { data } = rootNode

    if (matches) {
        matches.forEach((match) => {
            let str = deleteBrackets(match);
            let ast = getAst(str);

            walkNode(ast, {
                ...handler,
                Identifier:(path) => {
                    if (!isDataPath(path,node,rootNode)) return ;
                    let _name = path.node.name
                     data.push(_name)
                }
            })
        })

    }


}


export function getExpMatches(exp:string) {

    let reg = /(?<![-a-zA-Z]){{((?!}}).)+}}/g // 提取{{}}里面的内容

    let matches = exp.match(reg)

    return matches
}


export function hasDynamaticExpression(exp:string) {

  return !!getExpMatches(exp)
}

export function isDataPath(path:any,node:TemplateNode,rootNode:RootNode) {

    let { parentPath,node:idenNode } = path;
    let parentNode = parentPath.node;
    let { data } = rootNode


    if (
        parentPath &&
        parentNode.object &&
        parentNode.object !== idenNode
      )
        return; // 对象的子属性

      if (
        parentPath.isObjectProperty() &&
        parentNode.key === idenNode
      )
        return; // 对象的key

    let _name = idenNode.name

    if (checkNodeHasForSameName(node ,_name)) return;
    if (isPxsModule(_name,rootNode)) return ;
    if (isMethods(_name,rootNode)) return ;
   // if (data.includes(_name))    return ;

    return true;

}


export function getRootNode(node:TemplateNode | RootNode) {

    return node?.type === NodeTypes.ROOT ? node : getRootNode(node.parent)
}



export function TextNodeIsOnlyChild(node: TextNode | InterpolationNode) {

    let { parent } = node;
    return ElementNodeHasOnlyTextChild(parent as ElementNode)
  }
  

  export function ElementNodeHasOnlyTextChild(node: TemplateNode) {

    if (!node) return false;
    let { children = [] } = node;
  
    if (!children.length) return false;
  
    return children.length === 1 && (
      children[0].type === NodeTypes.TEXT ||
      children[0].type === NodeTypes.INTERPOLATION)
  }
  

  // 获取节点元素
export function getSblingNode(node:ElementNode,num:number) {

    let { parent } = node;
  
    let { children = [] } = parent!
  
    let index = _.findIndex(children,(item) => item === node)
  
    if (index !== -1) return children[index + num];
  
  }
  





export function processElemnetCodegenChild(node: TemplateNode,codegenNode:ElementCodegenNode) {

    if (!node) return;
    let { children = [] } = node;
  
    if (!children.length) return;
  
    if (ElementNodeHasOnlyTextChild(node)) {
  
        //@ts-ignore
      codegenNode!.children = children[0].codegenNode?.children;
    } else {
      //@ts-ignore
      codegenNode!.children = getChildrenCodegen(node)
    }
  }
  
  
  export function getChildrenCodegen(ast:TemplateNode | RootNode) {
    return ast.children?.filter((child) => !child.isRemoved)
    .map((child) => child.codegenNode)
  }
  


  export function normalizeComponentName(name:string) {
    return `sqb-${name}`
  }






  export type ResolveOptions = {
    context?:string // 当前文件的路径
    resolve?:{
        alias?:Record<string,string>,
        modules?:Array<string>
    }
  }







