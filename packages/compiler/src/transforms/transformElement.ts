import { SfcContext } from "../parse-sfc";
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
    CREATE_ELEMENT_VNODE
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


export function createTransfromElement(sfcContext:SfcContext) {

    let { parsedJson } = sfcContext
    let { components } = parsedJson
    function isComponentTag(name:string) {
        return !!_.find(components, { name })
    }

    

    return function(node:ElementNode,transformContext:TransformContext) {


        let { type, props , tag} = node as ElementNode;

        if (type !== NodeTypes.ELEMENT ) return ;


        


        return () => {

            //@ts-ignore
            if (node.type === NodeTypes.ROOT) return processRootNode(node,transformContext);

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
                return conditionCodeGenNode || forCodeGenNode || elementCodegenNode || componentCodeGenNode
            }

            function buildElementCodeGen():ElementCodegenNode {

                let elementCodegenNode:ElementCodegenNode = {
                    type: NodeTypes.ELEMENT,
                    //@ts-ignore
                    tag:`"${getTagMap(node.tag)}"`,
                    propsCodeGenNode,
                    tagKey:CREATE_ELEMENT_VNODE,
                }
    
                processElemnetCodegenChild(node as TemplateNode,elementCodegenNode);
               // elementCodegenNode!.hosited  = patchFlag ? undefined:context.hostied(elementCodegenNode)
               transformContext.helper(CREATE_ELEMENT_VNODE)
    
                return elementCodegenNode

            }


            function buildComponentCodegen(): ComponentCodegenNode{

                if (isComponentTag(tag)) return ;
                transformContext.helper(CREATE_COMPONENT_VNODE)

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
                let list = transformExpression(value!,node,transformContext,false)

                transformContext.helper(RENDER_LIST)

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
                    hasIf = transformExpression(item.value!,node,context,false)
                }

                item = _.find(props, { dirname : "else:if"})
                if (item) {
                    //@ts-ignore
                    hasElseIf = transformExpression(item.value!,node,context,false)
             }

                if (hasIf || hasElseIf) {

                    transformContext.helper(CREATE_COMMENT_VNODE)
                    return  {
                        type:NodeTypes.IF,
                        condition:hasIf || hasElseIf,
    
                        //@ts-ignore
                        trueBranch: forCodegenNode || elementCodegenNode
                    }
                }

            }




            function buildPropsCodeGen():PropsCodegenNode {

                let properties:Array<CodeGenProp> = []
                let ignoreProps = [
                    'if','for','else:if','else','for-item','for-index'
                ]

                let { props } = node;

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


                    let directiveProcessor = transformContext.options?.directives[dirname]
                    if (directiveProcessor) {
                        let res = directiveProcessor(prop,node,transformContext)
                        properties.push(res)
                    }else {
                        properties.push({
                            key,
                             //@ts-ignore
                            value: `"${transformExpression(value!,node,context)}"`
                        })
                    }

                }

                return {
                    type:NodeTypes.PROPS,
                    props:properties
                }

            }

        }


    }


}