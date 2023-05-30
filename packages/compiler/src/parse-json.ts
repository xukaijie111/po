import { ResolveOptions } from "./helper"

import {    
    createResolver,
    ignoreExt
} from '@po/cjs-utils'


export type JsonResult = {
    code:string,
    component:boolean,
    components:Array<{ name :string,path:string }>
}

export interface ParseJsonOptions extends ResolveOptions{
 
}

/**
 * 
 * @param code 
 * 
 * 
 */

export function parseJson(code:string,options:ParseJsonOptions) {

    let res:Record<string,any>

    let resolver = createResolver({
        extensions:['.pxml'],
        alias:options.resolve?.alias || {}
    })

    try {
        res = JSON.parse(code)
    } catch (error) {
        throw new Error(error)
    }

    let parsed:JsonResult = {
        code,
        component:false,
        components:[]
    }

    parsed.component = !!res.component;

    let usingComponents = res.usingComponents || {}

    for (let name in usingComponents) {
        let path = usingComponents[name];
        let target = resolver(options.context,path);


        parsed.components.push({
            name,
            path:ignoreExt(target as string)
        })
    }

    return parsed

}