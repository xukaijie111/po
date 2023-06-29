


// import rollup from 'rollup'

// import ts from 'rollup-plugin-typescript2'

// import resolve from '@rollup/plugin-node-resolve'

// import alias from '@rollup/plugin-alias'

// import {
//     Plugin,
//     InputOptions,
//     OutputOptions
// } from 'rollup'



// import {
//     readFileSync,
//     getAst,
//     walkNode,
//     getRelativePath,
//     generateCodeByAst,
//     ignoreExt
// } from '@po/cjs-utils'

// import {
//     RUNTIME_JSCORE_NPM,
//     JSCORE_APP_NAME,
//     JSCORE_PAGE_NAME,
//     JSCORE_COMPONENT_NAME
// } from '@po/shared'

// import template from '@babel/template'

// import {
//     NodePath
// } from '@babel/core'
// import { Compilation } from './Compilation'



// export class JsCoreCompiler {


//     constructor(private options: JsCoreCompiler.options) {

//     }



//     async run() {

//         let inputOptions:InputOptions = {
//             input:this.options.entry,
//             plugins:this.getPlugins(),
            
//         }
//         let outputOptions:OutputOptions = {
//             file:this.options.dist,
//             format:"cjs"
//         }

//         const bundle = await rollup.rollup(inputOptions);
//         await bundle.write(outputOptions);

//     }

//     getLastImportPath(path): NodePath {

//         let lastPath = path
//             .get('body')
//             .filter((p) => p.isImportDeclaration())
//             .pop();

//         return lastPath || path
//     }

//     handleAppFile() {
//         let entryFile = this.options.entry;
//         let componentFiles = this.options.componentFiles
//         let code = readFileSync(entryFile)

//         let ast = getAst(code);

//         walkNode(ast, {

//             Program: {
//                 enter: (path: NodePath) => {


//                     let appImportNode = template(`import { ${JSCORE_APP_NAME} ,container } from "${RUNTIME_JSCORE_NPM}";`, { sourceType: 'module' })

//                     let exportContainerNode = template(`export { container }`)
//                     //@ts-ignore
//                     path.unshiftContainer("body", appImportNode());

//                      //@ts-ignore
//                     path.pushContainer('body',exportContainerNode())

//                     componentFiles.forEach((res) => {

//                         let { file, compileResult } = res;
//                         let { name } = compileResult
//                         let rel = getRelativePath(entryFile, file)

//                         let lastPath = this.getLastImportPath(path)


//                         const myImport = template(`import {  ${name} } from "${rel}";`, { sourceType: 'module' });

//                         lastPath.insertAfter(myImport());

//                     })

//                 }
//             }
//         })

//         return generateCodeByAst(ast)

//     }


//     handleComponentFile(file:string) {

//         let detail = this.options.componentFiles.get(ignoreExt(file))

//         let { compileResult } = detail

//         let { name, pathWithProject, id } = compileResult

//         let { isPage } = compileResult

//         let code = readFileSync(file)
//         let ast = getAst(code)

//         walkNode(ast, {

//             Program: {
//                 enter: (path) => {

//                     let componentOrPageName = isPage ? JSCORE_PAGE_NAME : JSCORE_COMPONENT_NAME

//                     let componentImportNode = template(`import { ${componentOrPageName}} from "${RUNTIME_JSCORE_NPM}";`, { sourceType: 'module' })

//                     path.unshiftContainer("body", componentImportNode());

//                     let lastPath = this.getLastImportPath(path)


//                     const registerTemplate = template(`${componentOrPageName}.register({
//                     name:"${name}",
//                     templateId:"${id}",
//                     path:"${pathWithProject}",
//                     isPage:${isPage}
//                         })`)

//                     lastPath.insertAfter(registerTemplate());

//                     const exportTemplate = template(`export const ${name} = {}`)
//                     lastPath.insertAfter(exportTemplate());

//                 }
//             }
//         })


//         return generateCodeByAst(ast)

//     }


//     getAppJsPlugin():Plugin {
//         let self = this;
//         return {

//             name:"handle-app-js",
//             load(id) {
//                 let code = readFileSync(id);
//                 if (id === self.options.entry) {
//                     return {
//                         code:self.handleAppFile()
//                     }
//                 }
//                 if (self.options.componentFiles.has(ignoreExt(id))) {
//                     return  {
//                         code:  self.handleComponentFile(id)
//                     }
                  
//                 }

//                 return null
                
//             }
//         }
//     }

 
//     getPlugins() {

//         let plugins = [
//             this.getAppJsPlugin(),
//             ts({
//                 check:false
//             }),
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

//         let entries = []

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


// export namespace JsCoreCompiler {

//     export type options = {

//         entry: string,
//         componentFiles: Map<string, Record<any, any>>,
//         dist: string,
//         alias?: Record<any, any>,
//         compilation:Compilation
//     }
// }