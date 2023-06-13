
import {

    readFileSync,

} from '@po/cjs-utils'
import { RootNode } from './ast'

import {
    serialPageName,
    generateMixed
} from '@po/shared'



import {
    parseJson,
    JsonResult
} from './parse-json'

import {
    baseParse
} from './parse-template'

import {
    StyleResult,
    parseStyle
} from './parse-style'

import {
    transform
} from './transform'


import {
    processOnExpression
} from './transforms/on'
import {
    createTransfromElement
} from './transforms/transformElement'

import {
    transformInterpolation
} from './transforms/transformInterpolation'

import {
    transformText
} from './transforms/transformText'

import {
    generate
} from './code-gen'
import { ResolveOptions } from './helper'

import path from 'path'



export interface SfcOptions extends ResolveOptions {
        pathWithProject:string
}





export interface SfcContext  {
    file:string,
    json?:JsonResult,
    template?:RootNode,
    style?:StyleResult,
    options?:SfcOptions,
    getResolveOptions:(file:string) => ResolveOptions
}

export function createSfcContext(file: string,options:SfcOptions): SfcContext {

    let context = {
        file,
        options,
        getResolveOptions(file:string):ResolveOptions {

            let { dir } = path.parse(file)

            return {
                context:dir,
                resolve:options.resolve
            }
        }
    }
    return context
}


export interface CompileResult extends Pick<SfcContext,'json' | 'template' | 'style' | 'file'>{
    id:string,
    code:string,
    name:string,
    isPage:boolean,
    pathWithProject:string
}

async function pickContext(context: SfcContext): Promise<CompileResult> {

    let name = serialPageName(context.options.pathWithProject);
    return {

        json:context.json,
        template:context.template,
        style:context.style,
        file:context.file,
        id: generateMixed(),
        code: "",
        name,
        isPage:!context.json.component,
        pathWithProject:context.options.pathWithProject
    }

}

/**
 * 
 * @param input 
 * template path 
 */
export async function compileSfc(file: string ,options:SfcOptions): Promise<CompileResult> {

    let context = createSfcContext(file,options)

    compileJson(context);

    await compileStyle(context)

    compileTemplate(context)

    let res = await pickContext(context)
    let code = generate(res)

    res.code = code;

    return res;

}




async function compileStyle(context:SfcContext) {

    let { file } = context

    let styleFile = `${file}.less`
    let code = readFileSync(styleFile)
    let resolveOptions = context.getResolveOptions(styleFile)

    let parsed = await parseStyle({ code , ...resolveOptions})
    context.style = parsed;
}
function compileJson(context:SfcContext) {

    let { file } = context

    let jsonFile = `${file}.json`
    let code = readFileSync(jsonFile)
    let resolveOptions = context.getResolveOptions(jsonFile)

    let parsed = parseJson(code,resolveOptions)
    context.json = parsed;

}



function compileTemplate(context: SfcContext) {

    let { file } = context

    let templateFile = `${file}.pxml`
    let code = readFileSync(templateFile)

    let ast = baseParse(code)

    transform(ast, {

        transforms: [
            createTransfromElement(context),
            transformText,
            transformInterpolation
        ],
        directives: {
            on: processOnExpression
        }
    })

    context.template = ast;

}