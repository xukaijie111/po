import { SfcContext } from "../parse-sfc";
import {
    TransformContext
} from '../transform'

import {
    ElementNode,
    NodeTypes,
    PropsCodegenNode
} from '../ast'

import _ from 'lodash'

export function createTransfromElement(sfcContext:SfcContext) {

    let { parsedJson } = sfcContext
    let { components } = parsedJson
    function isComponentTag(name:string) {
        return !!_.find(components, { name })
    }

    

    return function(node:ElementNode,transformContext:TransformContext) {


        let { type } = node;

        if (type !== NodeTypes.ELEMENT ) return ;




        return () => {


           


        }


    }


}