

import ts from 'rollup-plugin-typescript2'
import json from '@rollup/plugin-json'


let pkg = require('./package.json')
let Path = require('path')

let resolve = function(value) {
    return Path.resolve(__dirname,value)
}


function createPlugins(dir) {

    const tsPlugin = ts({
        check:false,
        tsconfig: Path.resolve(__dirname, 'tsconfig.json'),
        tsconfigOverride: {
          compilerOptions: {
            rootDir:dir,
            target: 'es2015',
            declaration: true,
            emitDeclarationOnly: false,
            declarationMap: false,
          },
          include:[`${dir}/index.ts`],
          exclude: ['**/__tests__', 'test-dts']
        }
      })
    


    return [
        json({
            namedExports: false
          }),
        tsPlugin
    ]

}
let configs = [

    //Client
    {
        input:resolve('./src/client/index.ts'),
        output: {
            file:resolve(pkg.module),
            format:"es",
            sourcemap:true,
        },
        plugins:createPlugins(resolve('src/client'))
    },

     //Server
     {
        input:resolve('./src/server/index.ts'),
        output: {
            file:resolve(pkg.main),
            format:"cjs",
            sourcemap:true,
        },
        plugins:createPlugins(resolve('src/server'))
    }

]

console.log(`##config is `,configs)

export default configs;