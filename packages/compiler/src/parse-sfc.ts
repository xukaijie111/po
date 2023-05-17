
import {
    GetSameDirectoryFile,
    isComponentFile,
    relativeId,
    readFileSync,
    fileIsExist
} from '@po/cjs-utils'
import { RootNode } from './ast'

import {
    parseJson,
    JsonResult
} from './parse-json'

import {
    baseParse
} from './parse-template'

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

export type sfcOptions = {
    template:string,
    json:string,
    style:string,
}


function parseInputCode(template:string) {
    let jsonPath = GetSameDirectoryFile(template,'.json')
    let stylePath = GetSameDirectoryFile(template,'.less')
     let res = {
        template:readFileSync(template),
        json:readFileSync(jsonPath),
        style:fileIsExist(stylePath)?readFileSync(stylePath):""
     }   

     return res;
}

function getSfcOptions(input:string | sfcOptions) {
    let res :sfcOptions = input as sfcOptions

    if (typeof input === "string") {
        if (!isComponentFile) {
            console.warn(`file ${relativeId(input)} is not a component file`)
            return ;
        }
        res = parseInputCode(input)
    }

    return res;

}

export type SfcContext = {
    options:sfcOptions,
    parsedJson?:JsonResult,
    ast?:RootNode
}

export function createSfcContext(options:sfcOptions):SfcContext {

    return {
        options,
       
    }
}


function pickContext(context:SfcContext) {

    return {

        json:{
            rawCode:context.options.json,
            parsed:context.parsedJson  
        },
        template:{
            rawCode:context.options.template,
            ast:context.ast
        }
    }

}

/**
 * 
 * @param input 
 * template path or code
 */
export function compilerSfc(input:string | sfcOptions) {

   
    let options = getSfcOptions(input)

    let context = createSfcContext(options)

    context.parsedJson = parseJson(context.options.json)

    compileTemplate(context)


    return pickContext(context)
    
}



function compileTemplate(context:SfcContext) {

    let ast = baseParse(context.options.template)

      transform(ast, {

        transforms:[
            createTransfromElement(context),
            transformText,
            transformInterpolation
        ],
        directives:{
            on:processOnExpression
        }
    })

    context.ast = ast;
    
}