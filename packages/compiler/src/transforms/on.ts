import { AttributeDirectiveNode,TemplateNode } from "../ast";

import {
    TransformContext
} from '../transform'

import {    
    hasDynamaticExpression
} from '../helper'

import {
    transformExpression
} from './transformExpression'

export function processOnExpression(prop:AttributeDirectiveNode,node: TemplateNode,context: TransformContext) {

    let { dirname , value } = prop

    let result = {
        key:dirname,
        value
    }

    if (hasDynamaticExpression(value)) {
        value = `"${transformExpression(value,node,context)}"`
    }else {
        value = `"${value}"`
    }

    result.value = value;

    return result
}