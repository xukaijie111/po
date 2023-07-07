import { RootNode, baseParse, transform, generate} from "../compiler/index";
import { Base } from "./base";
import {
    readFileSync,
    serialComponentTageName
} from '@po/cjs-utils'

import _ from 'lodash'

import Path from "path"

import { JsonModule } from "./json";

export class TemplateModule extends Base {


    rootNode: RootNode


    init() {
        if (this.isComponentFile) {
            this.shareInfo =  this.compilation.getComponentShareInfo(this.src)
        }
        this.dist = this.dist.replace(/\.pxml/, '.pxml.js')
    }
    async load() {
        await super.load()
        let { src } = this

        let code = readFileSync(src)
        this.rootNode = baseParse(code)
    }



    getComponentJsonResult() {
        let { src } = this;
        let { dir, name } = Path.parse(src)
        let jsonFile = `${dir}/${name}.json`

       

        let jsonModule = this.compilation.getModule(jsonFile) as JsonModule


        return jsonModule.getParsedResult();

    }


    async transform(): Promise<void> {

        let jsonResult = this.getComponentJsonResult()

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


    async generate(): Promise<void> {
        
        let code = ""

        let jsonResult = this.getComponentJsonResult();

        let { components } = jsonResult;


        components.forEach((item) => {
            let { name,path } = item

            code += `import   ${serialComponentTageName(name)}  from "${this.compilation.getDistRelativePath(this.src,path)}";\n`

        })

        code += generate(this.rootNode, {
            getComponentShareInfo:() => {
                return this.shareInfo
            }
        })

        this.code = code;

    }


}