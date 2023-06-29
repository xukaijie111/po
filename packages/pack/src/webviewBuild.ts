

// import rollup from 'rollup'

// import ts from 'rollup-plugin-typescript2'

// import resolve from '@rollup/plugin-node-resolve'

// import alias from '@rollup/plugin-alias'
// import { Compilation } from './Compilation'

// import Commonjs from '@rollup/plugin-commonjs'


// import {

//     InputOptions,
//     OutputOptions
// } from 'rollup'

// export class WebviewCompile {

//     options:WebviewCompile.options
//     constructor(options:WebviewCompile.options) {

//         this.options = options

//     }


//    async run() {
//         let inputOptions:InputOptions = {
//             input:this.options.entry,
//             plugins:this.getPlugins(),
            
//         }
//         let outputOptions:OutputOptions = {
//             file:this.options.dist,
//             format:"es"
//         }

//         const bundle = await rollup.rollup(inputOptions);
//         await bundle.write(outputOptions);

//     }


//     getPlugins() {

//         let plugins = [
//             ts({
//                 check:false
//             }),
//             Commonjs(),
//             resolve({
//                 extensions:['.ts','.js'],
                
//             }),
//             alias(this.getAlias())
//         ]

//         return plugins
//     }


//     getAlias() {

//         let { compilation } = this.options;

//         let alias = compilation.options.alias;

//         let entries = [].concat(this.options.alias)

//         for (let key in alias) {
//             entries.push({
//                 find:key,
//                 replacement:alias[key]
//             })
//         }

//         return {
//             entries
//         }
//     }



// }




// export namespace WebviewCompile {

//     export type options = {

//         entry:string,
//         dist:string,
//         compilation:Compilation,
//         alias:Array<any>
//     }
// }