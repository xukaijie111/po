
import glob from 'glob'

import {
    relativeId,
    createResolver,
    getJsonContent,
    serialComponentTageName,
    readFileSync,
    generateCodeByAst,
    getAst,
    walkNode
} from "@po/cjs-utils"
import { PackJsCore } from '.'

import {
    generateMixed,
    serialPageName,
    JSCORE_PAGE_NAME,
    JSCORE_COMPONENT_NAME,
    RUNTIME_JSCORE_NPM
} from "@po/shared"

import Path from "path"
import { RootNode , generate ,     baseParse,
    transform } from './compiler'


import _ from "lodash"

import template from '@babel/template'
import { Node } from './node'


export type ComponentShareInfo = {

    name: string,
    id: string,
    pathWidthProject: string, // 相对工程的目录
    isPage: boolean

}

export type JsonResult = {
    parsed: Record<any, any>,
    component: boolean,
    components: Array<{ name: string, path: string, rawName: string }>
}

export class Component  extends Node{
    id: string
    options: Component.options
    basePath: string
    scriptFilePath: string
    jsonFilePath: string
    styleFilePath: string
    templateFilePath: string
    compilation: PackJsCore
    shareInfo: ComponentShareInfo
    jsonResult: JsonResult
    rootNode:RootNode
    constructor(options: Component.options) {
        super();
        this.options = options;
        this.id = this.basePath = options.basePath
        this.compilation = options.compilation
    }


    async parseFile(unit: string) {
        let { basePath } = this;
        let src = `${basePath}${unit}`
        let file = await glob.sync(src)

        if (!file || !file.length) {
            throw new Error(`Can not resolve file ${relativeId(src)}`)
        }

        return file[0]

    }
    async parseFiles() {
        this.scriptFilePath = await this.parseFile(`.{t,j}s`);
        this.jsonFilePath = await this.parseFile(`.json`);
        this.styleFilePath = await this.parseFile(`.less`);
        this.templateFilePath = await this.parseFile(`.pxml`);


        this.parseJsonFile();
        this.parseTemplateFile();

        this.setShareInfo();
    }


    parseTemplateFile() {

        let { templateFilePath ,  jsonResult } = this;
        let code = readFileSync(templateFilePath);
        this.rootNode = baseParse(code);

        let { components = [] } = jsonResult

        this.rootNode = transform(this.rootNode, {
            context: {
                isComponentTag(tag) {
                    return !!_.find(components, { rawName: tag })
                },

                getImportComponentLocalName(tag:string) {
                    return serialComponentTageName(tag)
                },


                getComponentTageName(tag:string) {
                    return serialComponentTageName(tag)
                }
            }
        })

    }

    parseJsonFile() {

        let res = getJsonContent(this.jsonFilePath);

        let parsed: JsonResult = {
            parsed: res,
            component: false,
            components: []
        }


        parsed.component = !!res.component;

        let resolver = this.getResolver([".ts",".js"])
        let usingComponents = res.usingComponents || {}

        let context = Path.parse(this.jsonFilePath).dir

        for (let name in usingComponents) {
            let path = usingComponents[name];
            let target = resolver(context, path) as string;

            let {dir:targetDir,name:targetName } = Path.parse(target)
            parsed.components.push({
                rawName: name,
                name: serialComponentTageName(name),
                path: `${targetDir}/${targetName}`
            })

        }

        this.jsonResult = parsed;

    }

    getJsonResult() {
        return this.jsonResult;
    }


    getResolver(suffixs: string[]) {
        return createResolver({
            extensions: suffixs,
            alias: this.compilation.getAlias() || {}
        })
    }


    setShareInfo() {

        let { basePath, jsonResult } = this;

        let projectPath = this.compilation.getProjectPath()

        let pathWidthProject = basePath.replace(`${projectPath}/`, '')

        let compName = serialPageName(pathWidthProject)

        this.shareInfo = {
            name: compName,
            pathWidthProject,
            id:compName,
            isPage: !jsonResult.component
        }


    }

    isPage() {
        return this.shareInfo.isPage
    }



    generateScriptCode() {


        let code = readFileSync(this.scriptFilePath)
        let ast = getAst(code)

        let { shareInfo } = this;

        let { name,id,pathWidthProject,isPage } = shareInfo

        walkNode(ast, {

            Program: {
                enter: (path) => {

                    let componentOrPageName = shareInfo.isPage ? JSCORE_PAGE_NAME : JSCORE_COMPONENT_NAME

                    let componentImportNode = template(`import { ${componentOrPageName}} from "${RUNTIME_JSCORE_NPM}";`, { sourceType: 'module' })

                    path.unshiftContainer("body", componentImportNode());

                    let lastPath = this.getLastImportPath(path)

                    let renderCode = generate(this.rootNode , { })

                    const renderTemplate = template(renderCode);

                    lastPath.insertAfter(renderTemplate());

                    const registerTemplate = template(`${componentOrPageName}.register({
                        name:"${name}",
                        render,
                        templateId:"${id}",
                        path:"${pathWidthProject}",
                        isPage:${isPage}
                    })`)

                    lastPath.insertAfter(registerTemplate());

                }
            }
        })


        return  generateCodeByAst(ast)

    }

}

export namespace Component {

    export type options = {

        basePath: string,
        compilation: PackJsCore
    }
}