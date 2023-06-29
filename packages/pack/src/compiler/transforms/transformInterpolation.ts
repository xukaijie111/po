
import {
    InterpolationNode,
    NodeTypes,

} from "../ast";

import {
    TransformContext,
} from '../transform'


import {
    CREATE_TEXT_NODE
} from '@po/shared'

import {
    transformExpression
} from './transformExpression'

export function transformInterpolation(node: InterpolationNode, context: TransformContext) {


    let { type ,value } = node;

    if (type !== NodeTypes.INTERPOLATION) return ;

    node.codegenNode = {
         //@ts-ignore
        children:transformExpression(value,node,context),
        type:NodeTypes.INTERPOLATION,
        tagKey:CREATE_TEXT_NODE,
    }

    context.helper(CREATE_TEXT_NODE)

}