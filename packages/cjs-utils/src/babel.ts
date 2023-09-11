

import * as babel from '@babel/core'

import generate from '@babel/generator'


const traverse = require("@babel/traverse").default;

export function transform(code:string,pl:any) {
  pl = pl || []
  let plugins =  [
    ["@babel/plugin-proposal-decorators", { legacy: true }],
    ["@babel/plugin-proposal-class-properties"],
    ["@babel/plugin-transform-typescript", { onlyRemoveTypeImports: true }],
    ...pl
    
  ];

  let result = babel.transformSync(code, {
    plugins,
    ast: true,
    babelrc: false,
    configFile: false,
  });

  return result;
}

export function getAst(code: string,plugins?:any) {
    
  let result = transform(code,plugins)
    return result!.ast;
  }


  export function transformSync(code:string,plugins = []) {

    return transform(code,plugins)
  }
  

export function walkNode(ast:babel.types.File,obj:any) {
    traverse(ast,obj);
}



export function generateCodeByAst(ast: any, options = { plugins :[]}) {
    return generate(ast,{
      //@ts-ignore
      plugins:options.plugins
    }).code;
  }
  