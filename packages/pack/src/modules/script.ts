import { File } from "@babel/types";
import { 
    createResolver,
    getAst,
    walkNode
 } from "@po/cjs-utils";
import { Base } from "./base";

import isCore from "is-core-module"
export class ScriptModule extends Base {
    ast:File
    init(): void {
        if (this.isComponentFile) {
            this.shareInfo =  this.compilation.getComponentShareInfo(this.src)
        }

        this.resolver = createResolver({
            extensions:['.ts','js'],
            alias:this.compilation.getAlias() || {}
        })
    }
    

    async load(): Promise<void> {
        
        this.handleDependency();

    }


    async transform(): Promise<void> {
        

    }


    handleDependency() {
        let { code } = this;

         this.ast = getAst(code)

        walkNode(this.ast, {


            ImportDeclaration:({ node }) =>{
                let importValue = node.source.value;
                this.addImport(importValue, node.source);
              },
          
              CallExpression:({ node }) => {
                const callee = node.callee;
                if (callee.name === 'require') {
                  const args = node.arguments;
                  const requireValue = args[0].value;
                  this.addImport(requireValue, args[0]);
                }
              },
          
              ExportNamedDeclaration: ({ node })=> {
                if (!node.source) return;
                const importValue = node.source.value;
                this.addImport(importValue, node.source);
              },
              ExportAllDeclaration:({ node }) =>{
                if (!node.source) return;
                const importValue = node.source.value;
                this.addImport(importValue, node.source);
              },

        })

    }

    addImport(local:string,source:string) {
        if (isCore(source)) return;
     
        let file = this.resolver(this.context,source) as string
        this.compilation.createModule(file)

    }



 
}