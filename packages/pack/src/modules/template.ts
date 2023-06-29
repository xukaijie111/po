import { RootNode,baseParse } from "../compiler/index";
import { Base } from "./base";
import {
    readFileSync
} from '@po/cjs-utils'



export class TemplateModule extends Base {


    rootNode:RootNode


    init() {
        this.dist = this.dist.replace(/\.pxml/,'.pxml.js')
    }
    async load() {
        let { src } = this
        let code = readFileSync(src)
        this.rootNode = baseParse(code)
    }


}