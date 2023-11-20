
import {
    TransformContext
} from '../transform'

import {
    ElementCodegenNode,
    TemplateNode,
    ElementNode,
    NodeTypes,
    PropsCodegenNode,
    PlaiElement,
    IfBranchCodegenNode,
    ForBranchCodeGenNode,
    ComponentCodegenNode,
    RootNode,
    CodeGenProp
} from '../ast'

import _ from 'lodash'
import { transformExpression } from "./transformExpression";
import {
    processElemnetCodegenChild,
    getSblingNode,
    getChildrenCodegen
} from '../helper'


import {
    RENDER_LIST,
    CREATE_COMPONENT_VNODE,
    CREATE_COMMENT_VNODE,
    CREATE_ELEMENT_VNODE,
    isComponentCustomPropKey,
    deleteBrackets
} from '@po/shared'


let tagMap = {
    "view":"div",
    "image":"img"
}


function getTagMap(tag:string) {
    if (tagMap[tag]) return tagMap[tag]

    return tag
}


function processRootNode(node:RootNode,context: TransformContext) {
    node.codegenNode = {
        tag:'"div"',
        tagKey:CREATE_ELEMENT_VNODE,
        type:NodeTypes.ROOT,
        children:getChildrenCodegen(node),
        hosited:undefined
    }
    context.helper(CREATE_ELEMENT_VNODE)

}


export function transfromElement(node:ElementNode,context:TransformContext) {

        let { type, props , tag} = node as ElementNode;
        

         //@ts-ignore
        if (type !== NodeTypes.ELEMENT && type !== NodeTypes.ROOT ) return ;


        return () => {

            
            //@ts-ignore
            if (node.type === NodeTypes.ROOT) return processRootNode(node,context);


            let hasIf,hasElseIf,hasElse

            let propsCodeGenNode = buildPropsCodeGen();

            let elementCodegenNode = buildElementCodeGen();

            let componentCodeGenNode = buildComponentCodegen();

            let forCodeGenNode = buildForCodeGen();

            let conditionCodeGenNode = buildConditionCodeGen();
            
            let currentCodegenNode = getCurrentCodeGenNode();


            hasElse = _.find(props,{ dirname :"else"})
            if (hasElseIf || hasElse) {
                let prevNode = getSblingNode(node as PlaiElement,-1);
                if (!prevNode) throw new Error("wx:else:if has no if branch");
    
                (prevNode!.codegenNode as IfBranchCodegenNode).falseBranch = currentCodegenNode;
                node.isRemoved = true;
    
                return;
            }

            node.codegenNode = currentCodegenNode;



            function getCurrentCodeGenNode() {
                return conditionCodeGenNode || forCodeGenNode || componentCodeGenNode || elementCodegenNode 
            }

            function buildElementCodeGen():ElementCodegenNode {

                if (context.isComponentTag(tag)) return ;
                let elementCodegenNode:ElementCodegenNode = {
                    type: NodeTypes.ELEMENT,
                    //@ts-ignore
                    tag:`"${getTagMap(node.tag)}"`,
                    propsCodeGenNode,
                    tagKey:CREATE_ELEMENT_VNODE,
                }
    
                processElemnetCodegenChild(node as TemplateNode,elementCodegenNode);
               // elementCodegenNode!.hosited  = patchFlag ? undefined:context.hostied(elementCodegenNode)
               context.helper(CREATE_ELEMENT_VNODE)
    
                return elementCodegenNode

            }


            function buildComponentCodegen(): ComponentCodegenNode{

                if (!context.isComponentTag(tag)) return ;
                context.helper(CREATE_COMPONENT_VNODE)

                return {
                    type:NodeTypes.COMPONENT,
                    //@ts-ignore
                    tag:`"${_.camelCase(node.tag)}"`,
                        //@ts-ignore
                    options:_.camelCase(node.tag),
                    propsCodeGenNode,

                    tagKey:CREATE_COMPONENT_VNODE,
                }
            }


            function buildForCodeGen():ForBranchCodeGenNode {

                let { props,forInfo } = node;

                if (!forInfo) return ;

                let { itemName,indexName, } = forInfo;
                let value = _.find(props,{ dirname :'for'}).value;
                let list = transformExpression(value!,node,context,false)

                context.helper(RENDER_LIST)

                return {
                    type:NodeTypes.FOR,
                    itemName,
                    indexName,
                    list:list,
                    item:elementCodegenNode
                }

            }


            function buildConditionCodeGen():IfBranchCodegenNode {
                let { props } = node
      
                let item = _.find(props, { dirname : "if"})
                if (item) {
                       //@ts-ignore
                    hasIf = transformExpression(item.value!,node,context)
                }

                item = _.find(props, { dirname : "else:if"})
                if (item) {
                    //@ts-ignore
                    hasElseIf = transformExpression(item.value!,node,context)
             }

                if (hasIf || hasElseIf) {

                    context.helper(CREATE_COMMENT_VNODE)
                    return  {
                        type:NodeTypes.IF,
                        condition:hasIf || hasElseIf,
    
                        //@ts-ignore
                        trueBranch: forCodeGenNode || elementCodegenNode
                    }
                }

            }




            function buildPropsCodeGen():PropsCodegenNode {

                let properties:Array<CodeGenProp> = []
                let ignoreProps = [
                    'if','for','else:if','else','for-item','for-index'
                ]

                let { props, tag } = node;

                for (let i = 0; i < props.length;i++) {

                    let prop = props[i];

                    //@ts-ignore
                    let { key , type , value  ,dirname } = prop ;


                    if (dirname && ignoreProps.includes(dirname)) continue;

                    if (type === NodeTypes.ATTRIBUTE_CONSTANT) {
                        properties.push({
                            key,
                            value:`"${value}"`
                        })
                        continue;
                    }


                    let directiveProcessor = context.options?.directives[dirname]
                    if (directiveProcessor) {
                        let res = directiveProcessor(prop,node,context)
                        properties.push(res)
                    }else {

                        let expression = `${transformExpression(value!,node,context)}`
                        // // 自定义的组件的时候，属性的值，是表达式的字符串，给jscore进行响应式处理
                        // // 如果是for,需要解析具体的值
                        // if (context.isComponentTag(tag) && isComponentCustomPropKey(key)) {
                        //     expression = getReallyExpression(value,node,expression)
                        // }

                        properties.push({
                            key,
                             //@ts-ignore
                            value: expression
                        })
                    }

                }

                return {
                    type:NodeTypes.PROPS,
                    props:properties
                }

            }



            function getReallyExpression(value:string,node:ElementNode,rawExpression:string) {

                let noBracketsValue = deleteBrackets(value);


                let isForItemExpression = false;

                let currentNode = node;

                while(currentNode) {

                    let { forInfo } = currentNode
                    if (forInfo) {

                        let { } = 
                    }
                    currentNode = currentNode.parent?

                }


            }

        }


    }


