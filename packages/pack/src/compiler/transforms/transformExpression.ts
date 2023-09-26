import { 

    getExpMatches,

    getRootNode,
    isDataPath
 } from "../helper";

 import {
    TemplateNode
 } from '../ast'

 import {
    TransformContext
 } from '../transform'

 import {
    getAst,
    generateCodeByAst,
    walkNode,
 } from '@po/cjs-utils'

 import {
    deleteBrackets
 } from '@po/shared'

 import { types } from '@babel/core'


export function transformExpression(exp:string,node:TemplateNode,context:TransformContext,isString = true) {

        if (!exp) return exp;

        let booleanReg = /^\s*{{\s*((?:true)|(?:false))\s*}}\s*$/
        let booleanMatch = exp.match(booleanReg)
        if (booleanMatch) return booleanMatch[1]



        let rootNode = getRootNode(node);

        let matches = getExpMatches(exp)

        if (matches) {
            matches.forEach((match) => {
                let str = deleteBrackets(match);
               str = processExpression(str);
               // for语句的列表不能转换成字符串
               if (isString) {
                     exp = exp.replace(match,"${" + str +"}")
               }else {
                    exp = exp.replace(match,str)
               }
              

             
            })

        }


        return  isString ? "`" + exp + "`" :exp;


        function processExpression(str:string) {
            let ast = getAst(str);

            walkNode(ast!, {

                // template 里的函数调用只能是来自wxs的
                //@ts-ignore
                CallExpression:({ node }) =>{
                    //@ts-ignore
                    if (types.isMemberExpression(node.callee)) {
                        let text =  node.callee?.object?.name 
                        if (hasDone(text)) return;
                        if (text) node.callee!.object!.name  = `_ctx.pxs.${text}`
                    }

                },

                //@ts-ignore
                Identifier:(path) => {

                    if (!isDataPath(path,node,rootNode)) return 
                    let name = path.node.name;
                    if (hasDone(name)) return ;
                    context.data(name);
                    path.node.name = `_ctx.${name}`

                }
            })

            let ret = generateCodeByAst(ast);
            ret = ret.replace(/;$/, '');
            return ret
        }


        function hasDone(str:string) {
            return str === "_ctx"
        }


}