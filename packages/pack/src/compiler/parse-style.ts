



const postcss = require("postcss");
const postcssLess = require("postcss-less");

import less  from "less";
import { ResolveOptions } from "./helper";


import {
    createResolver
} from '@po/cjs-utils'



let lessImportReg = /(?<!(?:\/\/|\/\*)\s*)@import\s+(["'][a-z0-9./\-_@]+(\.(less|scss))?(["'].*))/gi;


export type ParseStyleContext = {
    options:ParseStyleOptions
    code: string,
    rawCode: string,
    imports: any[],
    addImports: (key: string) => unknown,
    resolver:any
}


export interface ParseStyleOptions extends ResolveOptions {
    code:string,
}


function createParseStyleContext(options:ParseStyleOptions) {

    let {  code } = options

    let context :ParseStyleContext = {
        
        options,
        code,
        rawCode:code,
        imports:[],
   
        addImports:(key:string) => {
            if (context.imports.includes(key as never)) return ;
            context.imports.push(key)
        },
        resolver:createResolver({
            extensions:['.less'],
            alias:options.resolve?.alias || {}
        })
    }

    return context

}


async function generate(context: ParseStyleContext) {


    let { code } = context;
    let res;

    let reg = lessImportReg;
    reg.lastIndex = 0;
    let matches = code.match(reg);
    if (matches) {
        matches.forEach((match) => {
            /* eslint-disable-next-line */
            code = code.replace(match, function ($0, $1) {
                reg.lastIndex = 0;
                /* eslint-disable-next-line */
                return $0.replace(reg, function ($0, $1) {
                    return `@import (reference) ${$1}`;
                });
            });
        });
    }

    try {
        res = await less.render(code, { filename: undefined ,compress:true});
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }


    
    context.code = res.css;


}


async function transform(context: ParseStyleContext) {

    let { code } = context;

    let plugin = postcss.plugin("process", () => {
        return (root) => {
            root.walkDecls((node) => {
                // rpx->px
                let pxReg = /"[^"]+"|'[^']+'|url\([^\)]+\)|(\d*\.?\d+)px/g;
                if (!node.value.includes("rpx")) return;
                node.value = node.value.replace(pxReg, (m, $1) => {
                    if (!$1) return m;
                    return parseFloat($1) ? `${$1}px` : "0px"; // 转换*1
                });
            });

        };
    });

    let res = await postcss([plugin()]).process(code, {
        from: undefined,
        syntax: postcssLess
    });

    context.code = res.css
}


// 将依赖正常化，供less调用
// @import "@npm-style/flex";
function preProcessDependency(context: ParseStyleContext) {
    // let { code } = context;




    // let reg = lessImportReg;
    // reg.lastIndex = 0;
    // let matches = code.match(reg);
    // if (matches) {
    //     matches.forEach((match) => {
    //         /* eslint-disable-next-line */
    //         code = code.replace(match, function ($0, $1) {
    //             reg.lastIndex = 0;

    //             /* eslint-disable-next-line */
    //             return $0.replace(reg, function ($0, $1) {
    //                 for (let i = 0; i < aliasKeys.length; i++) {
    //                     let key = aliasKeys[i]
    //                     let reg = new RegExp(`${key}`)
    //                     if ($1.match(reg)) {
    //                         let localPath = $1.replace(/(?:\'|\")(.*)(?:\'|\";?)/, "$1"); // 这个婆解析，把引号都拿来了
    //                         let targetPath = resolver(dir, localPath);
    //                         let rel = getRelativePath(srcPath, targetPath);
    //                         $1 = `"${rel}";`
    //                         break
    //                     }
    //                 }

    //                 return `@import ${$1}`
    //             });


    //         });
    //     });
    // }

    // context.code = code;
}


async function walkStyle(context:ParseStyleContext) {

    let { code } = context
    let plugin = postcss.plugin('findDependency', () => {
        return (root, result) => {
          root.walkAtRules((rule) => {
            if (rule.name === 'import') {
              let relPath = rule.params;
              relPath = relPath.replace(/(?:\'|\")(.*)(?:\'|\")/, '$1'); // 这个婆解析，把引号都拿来了
              context.addImports(relPath)
            }
          });
        };
      });
    
      let res = await postcss([plugin()]).process(code, { from: undefined, syntax: postcssLess });

      context.code = res.css

}


export interface StyleResult  {
    code:string,
    imports:string[]
}

export async function parseStyle(options:ParseStyleOptions) {
    if (!options.code) return ;

    let context = createParseStyleContext(options)

    preProcessDependency(context);
    await walkStyle(context)

    await transform(context);

    await generate(context)

    let { code,imports } = context;
    return {
        code,
        imports
    }

}