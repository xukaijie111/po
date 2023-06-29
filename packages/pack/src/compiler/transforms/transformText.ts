
import {
    NodeTypes,
    TextNode,
} from "../ast";


import {
    TransformContext,
} from '../transform'


import {
    CREATE_TEXT_NODE
} from '@po/shared'
export function transformText(node: TextNode, context: TransformContext) {


    let { type ,value } = node;

    if (type !== NodeTypes.TEXT) return ;

    node.codegenNode = {
        children:`"${value}"`,
        type:NodeTypes.TEXT,
        tagKey:CREATE_TEXT_NODE,
    }


    context.helper(CREATE_TEXT_NODE)
}