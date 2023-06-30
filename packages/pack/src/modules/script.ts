import { createResolver } from "@po/cjs-utils";
import { Base } from "./base";


export class ScriptModule extends Base {


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
        
        if (!this.isComponentFile) return ;



    }


    handleDependency() {
        let { code } = this;

        
    }
 
}