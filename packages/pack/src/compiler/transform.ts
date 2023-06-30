
import {
    RootNode,
    TemplateNode,
    CodegenNode
} from './ast'

import _ from 'lodash'

import {
    processOnExpression
} from './transforms/on'
import {
    transfromElement
} from './transforms/transformElement'

import {
    transformInterpolation
} from './transforms/transformInterpolation'

import {
    transformText
} from './transforms/transformText'

import {
    RUNTIME_WEBVIEW_NPM
} from '@po/shared'


export type TransformOptions = {

    transforms?:Array<any>,
    directives?:Record<any,any>,
    context?:{
        isComponentTag:(tag:string) => boolean
    }


}


export type TransformContext = {
    options:TransformOptions,
    ast:RootNode,
    hostied:(p:any) => string
    helper:(s:any,t?:any) => unknown
    data:(key:string) => unknown,
    components:(key:string,value:string) => unknown
    clearComponents:() => unknown
    isComponentTag:(tag:string) => boolean
}


function createTransformContext(ast: RootNode,options:TransformOptions) {
    return {
        ast,
        options,

        hostied:(node:CodegenNode) => {

            let len = ast.hoists.length;
            ast.hoists.push(node);
            return `__po_hosited_${len}`

        },
        // 导入的其他文件或者npm 包
        helper(key:string,value:string = RUNTIME_WEBVIEW_NPM ) {

            let { helpers } = ast;

            let items = helpers[value];
            if (!items) items = helpers[value] = []
            if (items.includes(key)) return ;
            items.push(key)
        },

        data(key:string) {
            let { data } = ast;
            if (data.includes(key)) return ;
            data.push(key)
        },

        components(key:string,value:string) {
            let {components } = ast;
            if (_.find(components,{ key })) return ;
            components.push({ 
                key , 
                value ,
                cameKey:_.camelCase(key)
            })

        },

        clearComponents() {
            ast.components = []
        },

        isComponentTag(tag:string) {
            if (options.context.isComponentTag) {
                return options.context.isComponentTag(tag)
            }
            return false;
        }

    }
}

function mergeTransforms(options:TransformOptions) {

    options.transforms = options
                        .transforms
                        .concat([
                            transform,
                            transformText,
                            transformInterpolation
                        ])


    options.directives = Object.assign(options.directives || {}, {   on: processOnExpression } )
}

export function transform(ast: RootNode,options:TransformOptions) {

    mergeTransforms(options)

    let context = createTransformContext(ast,options)


    traverseNode(ast,context);

    return ast;

}


export function traverseNode(node:RootNode | TemplateNode,context:TransformContext) {

    let { options } = context;

    let { transforms } = options

    //@ts-ignore
    let { children } = node;
    let exits = []

    for (let i = 0 ; i < transforms.length;i++) {
        let transform = transforms[i];
        let exit  = transform(node,context)
         if (exit) exits.push(exit)
        
    }

    if (children) {
        children.forEach((child:TemplateNode) => {
            traverseNode(child,context)
        })
    }

   
    if (exits.length) {
        exits.forEach((ex) => ex())
    }

}
