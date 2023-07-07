import { RootNode,
    NodeTypes,
    CodegenNode,
    IfBranchCodegenNode,
    ForBranchCodeGenNode,
    PropsCodegenNode,
    ElementCodegenNode,
    ComponentCodegenNode,
    RootCodeGen
} from "./ast";

import {
    CREATE_COMMENT_VNODE,
    RENDER_LIST,
    helperNameMap,
    isString,
    isObject
} from '@po/shared'

import {
    ComponentShareInfo
} from '../helper'

export type GenerateOptions = {

    getComponentShareInfo:() => ComponentShareInfo

}

export type CodeGenContext = {
    options:GenerateOptions
    root:RootNode,
    code:string
    push: (p: any) => any,
    nextline: (num?: number) => void,
    getRootAst:() => RootNode
}


function createContext(root:RootNode,options:GenerateOptions):CodeGenContext {

        let context:CodeGenContext =  {
            options,
            root,
            code:"",
            push(str: string) {
                context.code += str
            },
    
            nextline(num: number = 1) {
                while (num) {
                    context.push('\n')
                    num--
                }
            },

            getRootAst() {
                return context.root
            }

        }


        return context;

}



export function generate(root:RootNode,options:GenerateOptions):string {

    let context = createContext(root,options)

    generateTemplate(context) 
    generateExport(context)

    return context.code;

}



function generateTemplate(context:CodeGenContext) {


    genImports(context);

    context.nextline()

    genImportComponents(context);
    genRender(context)

}

function genImportComponents(context: CodeGenContext) {
    let { push } = context
    let ast = context.getRootAst();
    let { components } = ast;

    components.forEach((comp) => {
        let { cameKey , value } = comp;
        push(`import ${cameKey} from "${value}";\n`)
    })

}


function genImports(context:CodeGenContext) {
    let ast = context.getRootAst();

    let { push } = context;
    let { helpers } = ast

    push(`import { `)

    let keys = Object.keys(helpers);

    keys.forEach((targetPath) => {

        let keys = helpers[targetPath];
        keys.forEach((key) => {
            let map = helperNameMap[key]
            push(`${map} as ${key}, `)
        })
        push(` } from "${targetPath}"`)

    })
}


function genRender(context: CodeGenContext) {

    let { push, nextline } = context;

    let ast = context.getRootAst();


    push(`function render(_ctx) {
            return `)

    

    genNode(ast.codegenNode!, context)

    nextline();

    push(`}`)
}



function genNode(node: CodegenNode, context: CodeGenContext) {

    let { type } = node;


    switch (type) {

        case NodeTypes.IF:

            genIfNode(node as IfBranchCodegenNode, context)
            break;

        case NodeTypes.FOR:
            genForNode(node as ForBranchCodeGenNode, context)
            break;
        case NodeTypes.PROPS:
            genNodeProps(node as PropsCodegenNode, context)
            break;
        case NodeTypes.ROOT:
            genRootNode(node as RootCodeGen,context);
            break;
        case NodeTypes.ELEMENT:
        case NodeTypes.TEXT:
        case NodeTypes.COMMENT:
        case NodeTypes.INTERPOLATION:
        case NodeTypes.COMPONENT:
            genElementNode(node, context)
            break;

    }

}

function genRootNode(node:RootCodeGen,context:CodeGenContext) {

    let { children } = node;

    children.forEach(element => {
        genNode(element,context)
        context.nextline();
    });

}

function genElementNode(node: CodegenNode, context: CodeGenContext) {

    let { push } = context

    let { tagKey } = node as ElementCodegenNode

    push(`${tagKey}(`)
    let list = getElementNodeParams(node)
    list.forEach((param, index) => {
        genElementNodeParams(param, context),
            index !== list.length - 1 && push(',')
    })
    push(`)`)
    

}



function getElementNodeParams(codegenNode: CodegenNode) {


    let { tag, propsCodeGenNode, children,type } = codegenNode as ElementCodegenNode | ComponentCodegenNode

    let source = [
        tag,
        propsCodeGenNode,
        isString(children) ? children : children && children.length ? children : undefined
    ]

    if (type === NodeTypes.COMPONENT) {
        //@ts-ignore
        source[1] = codegenNode.options
    }

    return source.map((s) => {
        //@ts-ignore
        return s ? (isString(s) ? s.replace(/\"/g, "'") : s) : "undefined"
    })

}



function genElementNodeParams(node: any, context: CodeGenContext) {

    let { push } = context
    if (isString(node)) {
        return push(node)
    } else {

        if (Array.isArray(node)) {
            push(`[\n`)
            node.forEach((n, index) => {
                genNode(n, context);
                arrayDelimter(node, index, context)
            })
            push(`]`)
        } else if (isObject(node)) {
            genNode(node as CodegenNode, context)
        } else {
            console.error(`what is this?`, node)
        }
    }
}



function genIfNode(node: IfBranchCodegenNode, context: CodeGenContext) {

    let { push } = context
    let { condition, trueBranch, falseBranch } = node

    push(condition)
    push(' ? ')

    genNode(trueBranch, context)

    push(':')

    if (falseBranch) genNode(falseBranch, context)
    else push(getCommentVnodeString(`条件为false`))

}



function genForNode(node: ForBranchCodeGenNode, context: CodeGenContext) {

    let { push } = context
    let { list, item, itemName, indexName } = node;


    push(`...${RENDER_LIST}(${list},function(${itemName},${indexName}){
        
                return `)

    genNode(item, context)



    push('})\n')

}



function genNodeProps(node: PropsCodegenNode, context: CodeGenContext) {

    let { push } = context
    let { type, props = [] } = node;

    if (type !== NodeTypes.PROPS) return push("undefined");

    let str = `{\n`

    props.forEach((prop) => {
        let { key, value } = prop
        value = value?.replace(/\"/g, "'")
        str += `${key}: ${value},\n`
    })

    str += `}\n`

    return push(str);

}



function arrayDelimter(list: unknown[], index: number, context: CodeGenContext) {
    list.length - 1 !== index && context.push(',')
}




function getCommentVnodeString(comment: string) {
    return `${CREATE_COMMENT_VNODE}(undefined,undefined,"${comment}")`
}



function generateExport(context:CodeGenContext) {


        let { push ,options  } = context;
        let shareInfo = options.getComponentShareInfo()
        let { name,id,pathWidthProject } = shareInfo

        push(`
            const ${name} = {
                name: "${name}",
                render,
                templateId:"${id}",
                path:"${pathWidthProject}"
            };

            export default ${name};
        `)

}